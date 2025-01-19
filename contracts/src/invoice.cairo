use core::starknet::ContractAddress;
use starknet::OptionTrait;

//TODO: To write the private invoice function
// generate hash, use the hash as key to the IPFS CID, send the hash to the payer,
// he uses the hash to fetch the cid and use the CID to fetch the private invoice data from IPFS

#[starknet::interface]
pub trait StarkPayTrait<T> {

    fn register(ref self: T, email: felt252, username: felt252);

    fn is_exist(self: @T, address: ContractAddress) -> bool;

    fn get_user(self: @T, address: ContractAddress) -> StarkPay::User;

    fn create_invoice(
            ref self: T,
            invoice_id: felt252,
            amount: felt252,
            currency: felt252,
            description: felt252,
            recipient_mail: felt252,
            due_date: u64,
        ) -> (felt252, ContractAddress);

    fn private_invoice(
        ref self: T,
        recipient_mail: felt252,
        amount: felt252,
        cid: felt252,
    );

    fn get_private_invoice_cid(self: @T, invoice_hash: felt252) -> felt252;

    fn get_invoice(
        self: @T,
        owner: ContractAddress,
        invoice_id: felt252
        ) -> StarkPay::InvoiceDTO;

    fn get_invoices_of(
        self: @T,
        owner: ContractAddress
    ) -> Array<StarkPay::InvoiceDTO>;

    fn get_payer_invoice(self: @T, email: felt252, invoice_id: felt252) -> StarkPay::InvoiceDTO;

    fn get_all_payer_invoices(self: @T, email: felt252) -> Array<StarkPay::InvoiceDTO>;

    fn get_all_paid_invoices_of(self: @T, owner: ContractAddress) -> Array<StarkPay::InvoiceDTO>;

    fn get_all_invoices_paid(self: @T, email: felt252) -> Array<StarkPay::InvoiceDTO>;

    fn get_all_invoices_generated(self: @T) -> Array<StarkPay::InvoiceDTO>;

    fn get_init(self: @T, _user: ContractAddress) -> Array<StarkPay::InvoiceDTO>;

    fn confirm_payment(ref self: T, owner: ContractAddress, email: felt252, invoice_id: felt252) -> (felt252, felt252);
}

#[starknet::contract]
pub mod StarkPay {
    use core::starknet::{
        ContractAddress,
        contract_address_const,
        get_caller_address,
        get_contract_address,
        get_block_timestamp
    };

    use core::starknet::storage::{
        Map,
        StoragePathEntry,
        StoragePointerReadAccess,
        StoragePointerWriteAccess
    };
    use core::array::Array;
    use starknet::OptionTrait;

    use core::{
        pedersen::PedersenTrait, hash::HashStateTrait,
    };

    #[derive(Drop, Serde, starknet::Store, Clone, PartialEq)]
    pub enum InvoiceStatus {
        NOTPAID,
        PAID
    }


    #[derive(Drop, Serde, starknet::Store, Clone, PartialEq)]
    pub struct Counts {
        invoice_count: u64,
        creator_count: u64,
        payer_count: u64
    }

    #[derive(Drop, Serde, starknet::Store, Clone, PartialEq)]
    pub struct User {
        email: felt252,
        username: felt252,
        address: ContractAddress,
        registered_at: u64,
    }

    #[derive(Drop, Serde, starknet::Store, Clone)]
    struct Invoice {
        invoice_id: felt252,
        creator: ContractAddress,
        recipient_mail: felt252,
        amount: felt252,
        description: felt252,
        currency: felt252,
        due_date: u64,
        private: bool,
        invoice_status: InvoiceStatus,
        generated_at: u64,
        counts: Counts
    }

    #[derive(Drop, Serde, starknet::Store, Clone)]
    struct InvoiceDTO {
        invoice_id: felt252,
        creator: ContractAddress,
        recipient_mail: felt252,
        amount: felt252,
        description: felt252,
        currency: felt252,
        due_date: u64,
        privacy: felt252,
        invoice_status: felt252,
        generated_at: u64,
    }

    #[storage]
    struct Storage {
        //user info
        users: Map<ContractAddress, User>,

        // private invoice
        private_invoices: Map<felt252, felt252>,

        // all invoices
        all_invoices_count: u64,
        all_invoices: Map<u64, Invoice>,

        //creator storage
        invoices: Map<ContractAddress, Map<felt252, Invoice>>,
        invoices_of: Map<ContractAddress, Map<u64, Invoice>>,
        my_count: Map<ContractAddress, u64>,

        //payer storage
        to_pay_invoices: Map<felt252, Map<felt252, Invoice>>,
        payer_invoices: Map<felt252, Map<u64, Invoice>>,
        payer_count: Map<felt252, u64>,
    }


    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        InvoiceCreated: InvoiceCreated,
        InvoicePaid: InvoicePaid,
        AccountCreated: AccountCreated,
        PrivateInvoice: PrivateInvoice,
    }

    #[derive(Drop, starknet::Event)]
    struct AccountCreated {
        #[key]
        email: felt252,
        #[key]
        username: felt252,
        #[key]
        address: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct InvoiceCreated {
        #[key]
      invoice_id: felt252,
      #[key]
      creator: ContractAddress,
      #[key]
      recipient_mail: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct InvoicePaid {
        #[key]
      invoice_id: felt252,
      message: felt252
    }

    #[derive(Drop, starknet::Event)]
    struct PrivateInvoice {
        #[key]
      invoice_hash: felt252
    }


    #[abi(embed_v0)]
    impl StarkPay of super::StarkPayTrait<ContractState> {

        fn register(ref self: ContractState, email: felt252, username: felt252) {

            let caller = get_caller_address();
            let user: User = User {
                email,
                username,
                address: caller,
                registered_at: get_block_timestamp(),
            };

            self.users.entry(get_caller_address()).write(user);

            self.emit(AccountCreated {
                email,
                username,
                address: caller,
            })
        }

        fn is_exist(self: @ContractState, address: ContractAddress) -> bool {

            let user: User = self.users.entry(address).read();

            if user.address  == contract_address_const::<0>() {
                false
            } else {
                true
            }
        }

        fn get_user(self: @ContractState, address: ContractAddress) -> User {
            self.users.entry(address).read()
        }

        fn create_invoice(
            ref self: ContractState,
            invoice_id: felt252,
            amount: felt252,
            currency: felt252,
            description: felt252,
            recipient_mail: felt252,
            due_date: u64,
        ) -> (felt252, ContractAddress) {

            let caller = get_caller_address();

            let new_invoice: Invoice = self._create_invoice(
                caller, invoice_id, amount, currency, recipient_mail, due_date, description
            );

            //save invoice
            self.invoices.entry(caller).entry(invoice_id).write(new_invoice.clone());

            //save personal invoice
           self.invoices_of.entry(caller).entry(new_invoice.counts.creator_count).write(new_invoice.clone());
           self.my_count.entry(caller).write(new_invoice.counts.creator_count);

           //payer invoices
           self.to_pay_invoices.entry(recipient_mail).entry(invoice_id).write(new_invoice.clone());

           self.payer_invoices.entry(recipient_mail).entry(new_invoice.counts.payer_count).write(new_invoice.clone());
           self.payer_count.entry(recipient_mail).write(new_invoice.counts.payer_count);

            // invoice counts
           self.all_invoices_count.write(new_invoice.counts.invoice_count);
           self.all_invoices.entry(new_invoice.counts.invoice_count).write(new_invoice.clone());

            self.emit(InvoiceCreated {
                invoice_id,
                creator: caller,
                recipient_mail
            });

            (invoice_id, caller)
        }

        fn private_invoice(ref self: ContractState, recipient_mail: felt252, amount: felt252, cid: felt252,) {

            let invoice_hash = PedersenTrait::new(0)
                .update(get_caller_address().into())
                .update(get_block_timestamp().into())
                .update(cid)
                .update(6)
                .finalize();

            self.private_invoices.entry(invoice_hash).write(cid);

            self.emit(PrivateInvoice{
                invoice_hash
            });
        }

        fn get_private_invoice_cid(self: @ContractState, invoice_hash: felt252) -> felt252 {

            self.private_invoices.entry(invoice_hash).read()
        }

        fn get_init(self: @ContractState, _user: ContractAddress) -> Array<InvoiceDTO> {

            let user: User = self.users.entry(_user).read();

            let mut init_invoices: Array<InvoiceDTO> = ArrayTrait::new();

            let count:u64 = self.my_count.entry(user.address).read();

            for index in 0..count {

                init_invoices.append(
                    self.invoice_dto(
                        self.invoices_of.entry(user.address).entry(index + 1).read()
                    )
                );
            };

            let p_count = self.payer_count.entry(user.email).read();

            for index in 0..p_count {
                init_invoices.append(
                    self.invoice_dto(self.payer_invoices.entry(user.email).entry(index + 1).read())
                );
            };

            init_invoices
        }

        fn get_invoice(self: @ContractState, owner: ContractAddress, invoice_id: felt252) -> InvoiceDTO {

            self.invoice_dto(
                self.invoices.entry(owner).entry(invoice_id).read()
            )
        }

        fn get_invoices_of( self: @ContractState,  owner: ContractAddress) -> Array<InvoiceDTO> {

            let count:u64 = self.my_count.entry(owner).read();

            let mut invoices:Array<InvoiceDTO> = ArrayTrait::new();

            for index in 0..count {

                invoices.append(
                    self.invoice_dto(
                     self.invoices_of.entry(owner).entry(index + 1).read()
                    )
                );
            };

            invoices
        }

        fn get_payer_invoice(self: @ContractState, email: felt252, invoice_id: felt252) -> InvoiceDTO{

           self.invoice_dto(
                self.to_pay_invoices.entry(email).entry(invoice_id).read()
           )
        }

        fn get_all_payer_invoices(self: @ContractState, email: felt252) -> Array<InvoiceDTO> {

            let p_count = self.payer_count.entry(email).read();

            let mut p_invoices: Array<InvoiceDTO> = ArrayTrait::new();

            for index in 0..p_count {

                p_invoices.append(
                    self.invoice_dto(
                        self.payer_invoices.entry(email).entry(index + 1).read()
                    )
                );
            };

            p_invoices
        }

        fn get_all_paid_invoices_of(self: @ContractState, owner: ContractAddress) -> Array<InvoiceDTO> {

            let count:u64 = self.my_count.entry(owner).read();

            let mut invoices:Array<InvoiceDTO> = ArrayTrait::new();

            for index in 0..count {

                let invoice: Invoice = self.invoices_of.entry(owner).entry(index + 1).read();

                if invoice.invoice_status != InvoiceStatus::PAID {
                    continue;
                }
                invoices.append(self.invoice_dto(invoice));
            };
            invoices
        }

        fn get_all_invoices_paid(self: @ContractState, email: felt252) -> Array<InvoiceDTO> {

            let p_count = self.payer_count.entry(email).read();

            let mut p_invoices: Array<InvoiceDTO> = ArrayTrait::new();

            for index in 0..p_count {

                let invoice: Invoice = self.payer_invoices.entry(email).entry(index + 1).read();

                if invoice.invoice_status != InvoiceStatus::PAID {
                    continue;
                }
                p_invoices.append(self.invoice_dto(invoice));
            };

            p_invoices
        }

        fn get_all_invoices_generated(self: @ContractState) -> Array<InvoiceDTO> {

            let all_counts: u64 = self.all_invoices_count.read();

            let mut _all_invoices: Array<InvoiceDTO> = ArrayTrait::new();

            for index in 0..all_counts {

                _all_invoices.append(
                    self.invoice_dto(
                        self.all_invoices.entry(index + 1).read()
                    )
                );
            };

            _all_invoices
        }

        fn confirm_payment(
            ref self: ContractState,
            owner: ContractAddress,
            email: felt252,
            invoice_id: felt252
            ) -> (felt252, felt252) {

                let owner_invoice: Invoice = self.invoices.entry(owner).entry(invoice_id).read();
                let mut payer_invoice: Invoice = self.to_pay_invoices.entry(email).entry(invoice_id).read();

                if owner_invoice.creator == payer_invoice.creator && owner_invoice.recipient_mail == payer_invoice.recipient_mail {
                    if payer_invoice.invoice_status != InvoiceStatus::PAID {

                        payer_invoice.invoice_status = InvoiceStatus::PAID;

                        self.update_invoice(payer_invoice.clone(), owner, email, invoice_id);

                    } else {
                        panic!("Paid Already!");
                    }
                }

                self.emit(InvoicePaid {
                    invoice_id,
                    message: 'Invoice paid!'
                });

                (email, invoice_id)
        }
    }

    #[generate_trait]
    pub impl internalImpl of InternalTrait {

        fn update_invoice(
            ref self: ContractState,
            payer_invoice: Invoice,
            owner: ContractAddress,
            email: felt252,
            invoice_id: felt252
        ) {
            self.invoices.entry(owner).entry(invoice_id).write(payer_invoice.clone());
            self.payer_invoices.entry(email).entry(payer_invoice.counts.payer_count).write(payer_invoice.clone());
            self.all_invoices.entry(payer_invoice.counts.payer_count).write(payer_invoice.clone());
            self.invoices_of.entry(owner).entry(payer_invoice.counts.creator_count).write(payer_invoice.clone());
            self.to_pay_invoices.entry(email).entry(invoice_id).write(payer_invoice.clone());
        }

        fn _create_invoice(
            ref self: ContractState,
            caller: ContractAddress,
            invoice_id: felt252,
            amount: felt252,
            currency: felt252,
            recipient_mail: felt252,
            due_date: u64,
            description: felt252,
            ) -> Invoice {


            let user: User = self.users.entry(caller).read();

            assert(user.email != recipient_mail, 'Not allowed!');

            let mut count: u64 = self.my_count.entry(caller).read();
            count += 1;
            let mut p_count: u64 = self.payer_count.entry(recipient_mail).read();
            p_count += 1;
            let mut all_count: u64 = self.all_invoices_count.read();
            all_count += 1;

            let new_invoice = Invoice {
                invoice_id,
                creator: caller,
                recipient_mail,
                amount,
                currency,
                generated_at: get_block_timestamp(),
                due_date,
                description,
                private: false,
                invoice_status: InvoiceStatus::NOTPAID,
                counts: Counts {
                    invoice_count: all_count,
                    creator_count: count,
                    payer_count: p_count,
                }
            };

            new_invoice
        }

        fn invoice_dto(self: @ContractState, invoice: Invoice) -> InvoiceDTO {

             InvoiceDTO {
                invoice_id: invoice.invoice_id,
                creator: invoice.creator,
                recipient_mail: invoice.recipient_mail,
                amount: invoice.amount,
                description: invoice.description,
                currency: invoice.currency,
                due_date: invoice.due_date,
                privacy: 'PUBLIC',
                invoice_status:  match invoice.invoice_status {
                    InvoiceStatus::PAID => 'PAID',
                    InvoiceStatus::NOTPAID => 'NOT PAID',
                },
                generated_at: invoice.generated_at,
            }
        }
    }
}

//https://sepolia.voyager.online/contract/0x00ad671719dd9c4f094c8efccecc3794ae0bd81c6a9ff2560cd02748ab492f0d#transactionst