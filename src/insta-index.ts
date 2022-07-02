import {
  Address,
  BigInt,
  Bytes,
  DataSourceContext,
} from "@graphprotocol/graph-ts";
import {
  InstaIndex,
  LogAccountCreated,
  LogNewAccount,
  LogNewCheck,
  LogNewMaster,
  LogUpdateMaster,
} from "../generated/undefined/InstaIndex";
import { CastEvent, Count, Account, Transaction } from "../generated/schema";
import { InstaAccount } from "../generated/undefined/InstaAccount";
import { InstaList } from "../generated/undefined/InstaList";
import { InstaAccount as InstaAccountABI } from "../generated/templates";

export const COUNT_ID = "all";
export const ZERO = new BigInt(0);

export function handleLogAccountCreated(event: LogAccountCreated): void {
  // event LogAccountCreated(address sender, address indexed owner, address indexed account, address indexed origin);

  let context = new DataSourceContext();
  context.setString("dsa", event.params.account.toHexString());
  InstaAccountABI.createWithContext(event.params.account, context);
  let countData = createOrLoadCounts(COUNT_ID);

  let contract = InstaIndex.bind(event.address);
  let instaAccount = InstaAccount.bind(event.params.account);
  let instaList = InstaList.bind(contract.list());
  let accountId = instaList.accountID(event.params.account);
  if (instaAccount.version() == BigInt.fromI32(2)) {
    let dsa = createOrLoadDsa(event.params.account.toHexString());

    dsa.creator = event.params.owner;
    dsa.address = event.params.account;
    dsa.version = instaAccount.version();
    if (instaAccount.version() == BigInt.fromI32(2)) {
      countData.accountTotal = countData.accountTotal.plus(BigInt.fromI32(1));
    }
    dsa.accountID = accountId;

    dsa.save();
  }

  countData.save();
}

//loads or creates smart account
export function createOrLoadDsa(id: string): Account {
  let account = Account.load(id);
  if (account == null) {
    account = new Account(id);
    account.version = ZERO;
    account.address = new Address(0);
    account.creator = new Address(0);
    account.transactionsCount = ZERO;
    account.transactions = [];
  }
  return account;
}

//creates instance for new transaction or loads existing one
export function createOrLoadTransaction(id: string): Transaction {
  let txn = Transaction.load(id);
  let countData = createOrLoadCounts(COUNT_ID);
  if (txn == null) {
    txn = new Transaction(id);
    txn.txnIndex = ZERO;
    txn.txnLogIndex = ZERO;
    txn.from = new Address(0);
    txn.to = new Address(0);
    txn.input = new Bytes(0);
    txn.blockNumber = ZERO;
    txn.timestamp = ZERO;
    txn.gasUsed = ZERO;
    txn.gasLimit = ZERO;
    txn.gasPrice = ZERO;
    txn.value = ZERO;
    txn.castEvents = [];
    txn.status = ZERO;
    txn.cumulativeGasUsed = ZERO;
    txn.logs = [];
    txn.logsBloom = new Bytes(0);
    txn.root = new Address(0);
    txn.castEvents = [];
    txn.approvals = [];
    txn.transfers = [];
    countData.transactionTotal = countData.transactionTotal.plus(
      BigInt.fromI32(1)
    );
  }
  countData.save();
  return txn;
}

// loading or generating new cast event 
export function createOrLoadEvent(id: string): CastEvent {
  let event = CastEvent.load(id);
  let countData = createOrLoadCounts(COUNT_ID);
  if (event == null) {
    event = new CastEvent(id);
    event.eventIndex = ZERO;
    event.sender = new Address(0);
    event.origin = new Address(0);
    event.value = ZERO;
    event.eventsNames = [];
    event.eventsParams = [];
    event.targetNames = [];
    countData.castEventTotal = countData.castEventTotal.plus(BigInt.fromI32(1));
  }
  countData.save();
  return event;
}

export function createOrLoadCounts(id: string): Count {
  let count = Count.load(id);
  if (count == null) {
    count = new Count("all");
    count.accountTotal = ZERO;
    count.transactionTotal = ZERO;
    count.castEventTotal = ZERO;
    count.transferEventTotal = ZERO;
    count.approvalEventTotal = ZERO;
  }
  return count;
}
