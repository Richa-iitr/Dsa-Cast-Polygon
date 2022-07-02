import {
  Address,
  BigInt,
  Bytes,
  dataSource,
  log,
} from "@graphprotocol/graph-ts";
import {
  LogCast,
  InstaAccount,
} from "../generated/templates/InstaAccount/InstaAccount";
import { Account, CastEvent, Transaction } from "../generated/schema";
import {
  createOrLoadEvent,
  createOrLoadDsa,
  createOrLoadTransaction,
} from "./insta-index";

export function handleLogCast(event: LogCast): void {
  let context = dataSource.context();
  let id = context.getString("dsa");
  let txId = event.transaction.hash.toHexString();
  let eventId =
    event.transaction.hash.toHexString() + event.logIndex.toHexString();

  log.info("transaction hash: {} and from: {} ", [
    event.transaction.hash.toHexString(),
    event.transaction.from.toHexString(),
  ]);
  log.info("ID: {}", [id]);

  let dsa = createOrLoadDsa(id);
  let transactions = createOrLoadTransaction(txId);
  let cast_event = createOrLoadEvent(eventId);

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
  // if(event.receipt?.logs)
  //   transactions.logs = event.receipt?.logs;

  // if (!!event.receipt) {
  //   if (!!event.receipt.cumulativeGasUsed)
  //     transactions.cumulativeGasUsed = event.receipt.cumulativeGasUsed;
  //   if (!!event.receipt.logsBloom)
  //     transactions.logsBloom = event.receipt.logsBloom;
  //   if (!!event.receipt.root) transactions.root = event.receipt.root;
  //   if (!!event.receipt.status) transactions.status = event.receipt.status;
  // }

  // let _logs: Bytes[] | null = transactions.logs;
  // if (!!event.receipt) {
  //   if (!!event.receipt.logs) {
  //     event.receipt.logs.forEach((a: any) => {
  //       if (_logs == null) {
  //         _logs = [];
  //       }
  //       _logs.push(a);
  //     });
  //   }
  // }

  cast_event.eventsNames = event.params.eventNames;
  cast_event.eventsParams = event.params.eventParams;
  cast_event.targetNames = event.params.targetsNames;
  cast_event.sender = event.params.sender;
  cast_event.origin = event.params.origin;
  cast_event.value = event.params.value;
  cast_event.eventIndex = event.logIndex;

  let txnEvents = transactions.castEvents;
  txnEvents.push(cast_event.id);
  transactions.castEvents = txnEvents;

  let txns = dsa.transactions;
  let index = txns.indexOf(transactions.id);
  if (index == -1) {
    txns.push(transactions.id);
    dsa.transactionsCount = dsa.transactionsCount.plus(
      BigInt.fromI32(txns.length)
    );
  } else {
    txns[index] = transactions.id;
  }
  dsa.transactions = txns;

  dsa.save();
  transactions.save();
  cast_event.save();
}
