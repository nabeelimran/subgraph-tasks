import { BigInt, Entity } from "@graphprotocol/graph-ts"
import {
  daostake,
  BaseInterestUpdated,
  OwnershipTransferred,
  Paused,
  StakeCompleted,
  Unpaused,
  Unstake
} from "../generated/daostake/daostake"
import { StakeEntity, UnstakeEntity, StakingUser, Transaction, Contract } from "../generated/schema"

// export function handleBaseInterestUpdated(event: BaseInterestUpdated): void {}

// export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

// export function handlePaused(event: Paused): void {}

export function handleStakeCompleted(event: StakeCompleted): void {
  let entity = StakeEntity.load(event.transaction.hash.toHex())
  if (!entity) {
    entity = new StakeEntity(event.transaction.hash.toHex())
  }
  entity.altQuantity = event.params.altQuantity
  entity.initiationTimestamp = event.params.initiationTimestamp
  entity.durationTimestamp = event.params.durationTimestamp
  entity.rewardAmount = event.params.rewardAmount
  entity.staker = event.params.staker
  entity.phnxContractAddress = event.params.phnxContractAddress
  entity.portalAddress = event.params.portalAddress
  entity.save()

  let user = StakingUser.load(event.params.staker.toHex())
  if (!user) {
    user = new StakingUser(event.params.staker.toHex())
  }
  user.stakedAmount = user.stakedAmount.plus(event.params.altQuantity)
  user.save()

  let contract = Contract.load("1")
  if (!contract) {
    contract = new Contract("1")
  }
  contract.stakedAmount = contract.stakedAmount.plus(event.params.altQuantity)
  contract.totalReward = contract.totalReward.plus(event.params.rewardAmount)
  contract.save()

  let transaction = new Transaction(event.transaction.hash.toHex())
  transaction.blockNumber = event.block.number
  transaction.timestamp = event.block.timestamp
  transaction.type = "Stake"
  transaction.amount = event.params.altQuantity
  transaction.txHash = event.transaction.hash.toHexString()
  transaction.user = event.params.staker.toHexString()
  transaction.save()
}

// export function handleUnpaused(event: Unpaused): void {}

export function handleUnstake(event: Unstake): void {
  let entity = UnstakeEntity.load(event.transaction.hash.toHex())
  if (!entity) {
    entity = new UnstakeEntity(event.transaction.hash.toHex())
  }
  entity.staker = event.params.staker
  entity.stakedToken = event.params.stakedToken
  entity.portalAddress = event.params.portalAddress
  entity.altQuantity = event.params.altQuantity
  entity.durationTimestamp = event.params.durationTimestamp
  entity.save()

  let user = StakingUser.load(event.params.staker.toHex())
  if (!user) {
    user = new StakingUser(event.params.staker.toHex())
  }
  user.stakedAmount = user.stakedAmount.minus(event.params.altQuantity)
  user.save()

  let contract = Contract.load("1")
  if (!contract) {
    contract = new Contract("1")
  }
  contract.stakedAmount = contract.stakedAmount.minus(event.params.altQuantity)
  contract.save()

  let transaction = new Transaction(event.transaction.hash.toHex())
  transaction.blockNumber = event.block.number
  transaction.timestamp = event.block.timestamp
  transaction.type = "Unstake"
  transaction.amount = event.params.altQuantity
  transaction.txHash = event.transaction.hash.toHexString()
  transaction.user = event.params.staker.toHexString()
  transaction.save()
}
