# Mappings

### insta-index.ts

Tracks the creation of any new DSA by tracking the `LogAccountCreated` event. It stores the data related to DSA in the entity `Account` and then passes the account address the DSA address as context to be handled by the `handleLogCast` which extracts further transaction details of the account.

### insta-account.ts

Tracks the transactions of account, mainly `cast` transactions. Stores the transactions details and cast events detaisl in the `Transaction` entity and the events associated with the cast in `CastEvent` entity.

### erc20.ts

Tracks the transfers and approvals of ERC20 tokens or the tokens with event signature same as `Transfer(indexed address,indexed address,uint256)`, `Transfer(indexed address,indexed address,uint256)` and stores those transactions where the sender or receiver is a defi smart account. The relevant data gets stored in the `Transaction` entity under transfers and approvals fields accordingly.

The counts of total accounts, total transactions, total cast, transfer and approval events is stored in `Count` entity and updated in the respective files.
