import { BigInt } from "@graphprotocol/graph-ts"
import {
  Approval,
  Burn,
  Transfer
} from "../generated/phoenixDAO/phoenix"
import { ApprovalEntity, BurnEntity, TransferEntity, TokenUser, TokenStat } from "../generated/schema"

export function handleApproval(event: Approval): void {
  let approval = ApprovalEntity.load(event.transaction.from.toHex())
  if (!approval) {
    approval = new ApprovalEntity(event.transaction.from.toHex())
  }

  approval._owner = event.params._owner
  approval._spender = event.params._spender
  approval._amount = event.params._amount

  approval.save()

  let user = TokenUser.load(event.params._owner.toHex());
  if (!user) {
    user = new TokenUser(event.params._owner.toHex());
  }
  user._allowanceAmount = event.params._amount;

  user.save();
}

export function handleBurn(event: Burn): void {
  let burn = new BurnEntity(event.transaction.hash.toHex())
  burn._burner = event.params._burner
  burn._amount = event.params._amount
  burn.save()

  let amount = parseInt(event.params._amount.toString())/10**18;

  let tokenStat = TokenStat.load("1");
  if (!tokenStat) {
    tokenStat = new TokenStat("1");
    tokenStat._totalSupply = BigInt.fromI32(110000000);
  }
  tokenStat._totalSupply = tokenStat._totalSupply.minus(BigInt.fromI64(amount as i64));
}

export function handleTransfer(event: Transfer): void {
  let transfer = new TransferEntity(event.transaction.hash.toHex())
  transfer._from = event.params._from
  transfer._to = event.params._to
  transfer._amount = event.params._amount
  transfer.timestamp = event.block.timestamp
  transfer.save()
  
  let tokenStat = TokenStat.load("1");

  let receiver = TokenUser.load(event.params._to.toHex());
  let sender = TokenUser.load(event.params._from.toHex());

  if (!tokenStat) {
    tokenStat = new TokenStat("1");
    tokenStat._totalSupply = BigInt.fromI32(110000000);
  }
  
  if (!receiver) {
    receiver = new TokenUser(event.params._to.toHex());
    tokenStat._holders = tokenStat._holders.plus(BigInt.fromI64(1));
  } else if(receiver._balance.le(BigInt.fromI64(0)) 
  && receiver.id.toString().toLowerCase() != "0xf8d5a45c4b5fe0e56e51e00f84b29ab9b9fd9f8b".toLowerCase()) {
    tokenStat._holders = tokenStat._holders.plus(BigInt.fromI64(1));
  }

  if (!sender) {
    sender = new TokenUser(event.params._from.toHex());
    tokenStat._holders = tokenStat._holders.plus(BigInt.fromI64(1));
  }

  if(transfer._amount) {
    receiver._balance = receiver._balance.plus(event.params._amount);
    sender._balance = sender._balance.minus(event.params._amount);
    if(
      sender._balance.le(BigInt.zero()) 
      && sender.id.toString().toLowerCase() != "0xf8d5a45c4b5fe0e56e51e00f84b29ab9b9fd9f8b".toLowerCase()
    ) {
      tokenStat._holders = tokenStat._holders.minus(BigInt.fromI64(1));
    }
  }
  tokenStat.save()
  receiver.save()
  sender.save()
}
