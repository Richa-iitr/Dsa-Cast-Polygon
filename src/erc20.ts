import {
  Address,
  BigInt,
  Bytes,
  dataSource,
  ethereum,
  log,
} from "@graphprotocol/graph-ts";
import { Approval, ERC20, Transfer } from "../generated/ERC20/ERC20";
import {
  Account,
  TransferEvent,
  ApprovalEvent,
  Token,
  CastEvent,
} from "../generated/schema";
import { Cast1Call } from "../generated/undefined/InstaAccount";
import {
  createOrLoadEvent,
  createOrLoadDsa,
  createOrLoadTransaction,
  createOrLoadCounts,
  COUNT_ID,
  ZERO,
} from "./insta-index";

export function handleTransfer(event: Transfer): void {
  let token = createOrLoadToken(event);
  let countData = createOrLoadCounts(COUNT_ID);
  let accountFrom = Account.load(event.params.from.toHexString());
  let accountTo = Account.load(event.params.to.toHexString());

  if (accountFrom != null || accountTo != null) {
    countData.transferEventTotal = countData.transferEventTotal.plus(
      BigInt.fromI32(1)
    );
    let transferId =
      event.transaction.hash.toHexString() +
      countData.transferEventTotal.toString();
    let transfers = createOrLoadTransferEvent(transferId);
    let transactions = createOrLoadTransaction(
      event.transaction.hash.toHexString()
    );

    let cast_event = CastEvent.load(event.transaction.hash.toHexString());
    if (cast_event == null) {
        transfers.withCast = ZERO;
    } else {
        transfers.withCast = new BigInt(1);
    }

    transfers.token = token.id;
    transfers.from = event.params.from;
    transfers.to = event.params.to;
    transfers.value = event.params.value;

    transactions.blockNumber = event.block.number;
    transactions.timestamp = event.block.timestamp;
    transactions.gasUsed = event.block.gasUsed;
    transactions.txnIndex = event.transaction.index;
    transactions.txnLogIndex = event.transactionLogIndex;
    transactions.from = event.transaction.from;
    transactions.to = event.transaction.to;
    transactions.input = event.transaction.input;
    transactions.gasPrice = event.transaction.gasPrice;
    transactions.gasLimit = event.transaction.gasLimit;
    transactions.value = event.transaction.value;

    let transferEvents = transactions.transfers;
    transferEvents.push(transfers.id);
    transactions.transfers = transferEvents;

    if (accountFrom != null) {
      let txns = accountFrom.transactions;
      let index = txns.indexOf(transactions.id);
      if (index == -1) {
        txns.push(transactions.id);
        accountFrom.transactionsCount = BigInt.fromI32(txns.length);
      } else {
        txns[index] = transactions.id;
      }
      accountFrom.transactions = txns;
      accountFrom.save();
    }

    if (accountTo != null) {
      let txns = accountTo.transactions;
      let index = txns.indexOf(transactions.id);
      if (index == -1) {
        txns.push(transactions.id);
        accountTo.transactionsCount = BigInt.fromI32(txns.length);
      } else {
        txns[index] = transactions.id;
      }
      accountTo.transactions = txns;
      accountTo.save();
    }
    transfers.save();
    transactions.save();
  }
  token.save();
  countData.save();
}

export function handleApproval(event: Approval): void {
  let token = createOrLoadToken(event);
  let countData = createOrLoadCounts(COUNT_ID);
  let accountFrom = Account.load(event.params.owner.toHexString());
  let accountTo = Account.load(event.params.spender.toHexString());

  if (accountFrom != null || accountTo != null) {
    countData.approvalEventTotal = countData.approvalEventTotal.plus(
      BigInt.fromI32(1)
    );
    let approvalId =
      event.transaction.hash.toHexString() +
      countData.approvalEventTotal.toString();
    let approvals = createOrLoadApprovalEvent(approvalId);
    let transactions = createOrLoadTransaction(
      event.transaction.hash.toHexString()
    );

    approvals.token = token.id;
    approvals.from = event.params.owner;
    approvals.to = event.params.spender;
    approvals.value = event.params.value;

    transactions.blockNumber = event.block.number;
    transactions.timestamp = event.block.timestamp;
    transactions.gasUsed = event.block.gasUsed;
    transactions.txnIndex = event.transaction.index;
    transactions.txnLogIndex = event.transactionLogIndex;
    transactions.from = event.transaction.from;
    transactions.to = event.transaction.to;
    transactions.input = event.transaction.input;
    transactions.gasPrice = event.transaction.gasPrice;
    transactions.gasLimit = event.transaction.gasLimit;
    transactions.value = event.transaction.value;

    let approvalEvents = transactions.approvals;
    approvalEvents.push(approvals.id);
    transactions.approvals = approvalEvents;

    if (accountFrom != null) {
      let txns = accountFrom.transactions;
      let index = txns.indexOf(transactions.id);
      if (index == -1) {
        txns.push(transactions.id);
        accountFrom.transactionsCount = BigInt.fromI32(txns.length);
      } else {
        txns[index] = transactions.id;
      }
      accountFrom.transactions = txns;
      accountFrom.save();
    }

    if (accountTo != null) {
      let txns = accountTo.transactions;
      let index = txns.indexOf(transactions.id);
      if (index == -1) {
        txns.push(transactions.id);
        accountTo.transactionsCount = BigInt.fromI32(txns.length);
      } else {
        txns[index] = transactions.id;
      }
      accountTo.transactions = txns;
      accountTo.save();
    }
    approvals.save();
    transactions.save();
  }
  token.save();
  countData.save();
}

export function createOrLoadToken(event: ethereum.Event): Token {
  let token = Token.load(event.address.toHex());
  if (token == null) {
    let erc20 = ERC20.bind(event.address);
    token = new Token(event.address.toHex());
    let _name = erc20.try_name();
    token.name = _name.reverted ? "" : erc20.name();

    let _symbol = erc20.try_symbol();
    token.symbol = _symbol.reverted ? "" : erc20.symbol();

    let _decimal = erc20.try_decimals();
    token.decimals = _decimal.reverted ? new BigInt(0) : erc20.decimals();
    token.save();
  }
  return token;
}

export function createOrLoadTransferEvent(id: string): TransferEvent {
  let transferEvent = TransferEvent.load(id);
  if (transferEvent == null) {
    transferEvent = new TransferEvent(id);
  }
  return transferEvent;
}

export function createOrLoadApprovalEvent(id: string): ApprovalEvent {
  let approvalEvent = ApprovalEvent.load(id);
  if (approvalEvent == null) {
    approvalEvent = new ApprovalEvent(id);
  }
  return approvalEvent;
}
