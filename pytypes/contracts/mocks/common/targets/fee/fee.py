
from __future__ import annotations

import dataclasses
from typing import List, Dict, Optional, overload, Union, Callable, Tuple
from typing_extensions import Literal

from woke.development.core import Contract, Library, Address, Account, Chain, RequestType
from woke.development.primitive_types import *
from woke.development.transactions import TransactionAbc, TransactionRevertedError

from enum import IntEnum

from pytypes.contracts.common.access.roles.fee.fee import FeeCollectorRole
from pytypes.contracts.common.access.roles.fee.ifee import IFeeCollectorRole



class MockFeeCollectorTarget(FeeCollectorRole, IFeeCollectorRole):
    """
    [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/targets/fee/fee.sol#7)
    """
    _abi = {'constructor': {'inputs': [{'internalType': 'address', 'name': 'a_', 'type': 'address'}], 'stateMutability': 'nonpayable', 'type': 'constructor'}, b'\x92E)\r': {'inputs': [{'internalType': 'address', 'name': 'newFeeCollectorTarget_', 'type': 'address'}], 'name': 'changeFeeCollector', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function'}, b'\xc4\x15\xb9\\': {'inputs': [], 'name': 'feeCollector', 'outputs': [{'internalType': 'address', 'name': '', 'type': 'address'}], 'stateMutability': 'view', 'type': 'function'}, b'\x01\x9d\x93V': {'inputs': [], 'name': 'feeCollectorIsLocked', 'outputs': [{'internalType': 'bool', 'name': '', 'type': 'bool'}], 'stateMutability': 'view', 'type': 'function'}, b'rR\x1d\xcd': {'inputs': [], 'name': 'lockFeeCollector', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function'}}
    _creation_code = "608060405234801561000f575f80fd5b506040516104ba3803806104ba83398181016040528101906100319190610163565b6100408161004660201b60201c565b506101b6565b5f60149054906101000a900460ff161561008c576040517f168c329e00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b805f806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507f3908cc4801f68d354a4e28f598ec87870f4b8a4b9a945c81b641d1b677575d52816040516100fa919061019d565b60405180910390a150565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61013282610109565b9050919050565b61014281610128565b811461014c575f80fd5b50565b5f8151905061015d81610139565b92915050565b5f6020828403121561017857610177610105565b5b5f6101858482850161014f565b91505092915050565b61019781610128565b82525050565b5f6020820190506101b05f83018461018e565b92915050565b6102f7806101c35f395ff3fe608060405234801561000f575f80fd5b506004361061004a575f3560e01c8063019d93561461004e57806372521dcd1461006c5780639245290d14610076578063c415b95c14610092575b5f80fd5b6100566100b0565b60405161006391906101f7565b60405180910390f35b6100746100c5565b005b610090600480360381019061008b919061026e565b6100cf565b005b61009a6100db565b6040516100a791906102a8565b60405180910390f35b5f8060149054906101000a900460ff16905090565b6100cd610102565b565b6100d88161011e565b50565b5f805f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60015f60146101000a81548160ff021916908315150217905550565b5f60149054906101000a900460ff1615610164576040517f168c329e00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b805f806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507f3908cc4801f68d354a4e28f598ec87870f4b8a4b9a945c81b641d1b677575d52816040516101d291906102a8565b60405180910390a150565b5f8115159050919050565b6101f1816101dd565b82525050565b5f60208201905061020a5f8301846101e8565b92915050565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61023d82610214565b9050919050565b61024d81610233565b8114610257575f80fd5b50565b5f8135905061026881610244565b92915050565b5f6020828403121561028357610282610210565b5b5f6102908482850161025a565b91505092915050565b6102a281610233565b82525050565b5f6020820190506102bb5f830184610299565b9291505056fea26469706673582212200362bcbd352e845fc80f795c9b519ff287eefc2a9d0cdeb8c1379b1cca339c5664736f6c63430008140033"

    @overload
    @classmethod
    def deploy(cls, a_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, return_tx: Literal[False] = False, request_type: Literal["call"], chain: Optional[Chain] = None, gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> bytearray:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/targets/fee/fee.sol#8)

        Args:
            a_: address
        """
        ...

    @overload
    @classmethod
    def deploy(cls, a_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, return_tx: Literal[False] = False, request_type: Literal["tx"] = "tx", chain: Optional[Chain] = None, gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> MockFeeCollectorTarget:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/targets/fee/fee.sol#8)

        Args:
            a_: address
        """
        ...

    @overload
    @classmethod
    def deploy(cls, a_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, return_tx: Literal[False] = False, request_type: Literal["estimate"], chain: Optional[Chain] = None, gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> int:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/targets/fee/fee.sol#8)

        Args:
            a_: address
        """
        ...

    @overload
    @classmethod
    def deploy(cls, a_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, return_tx: Literal[False] = False, request_type: Literal["access_list"], chain: Optional[Chain] = None, gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Tuple[Dict[Address, List[int]], int]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/targets/fee/fee.sol#8)

        Args:
            a_: address
        """
        ...

    @overload
    @classmethod
    def deploy(cls, a_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, return_tx: Literal[True], request_type: Literal["tx"] = "tx", chain: Optional[Chain] = None, gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> TransactionAbc[MockFeeCollectorTarget]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/targets/fee/fee.sol#8)

        Args:
            a_: address
        """
        ...

    @classmethod
    def deploy(cls, a_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, return_tx: bool = False, request_type: RequestType = "tx", chain: Optional[Chain] = None, gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Union[bytearray, MockFeeCollectorTarget, int, Tuple[Dict[Address, List[int]], int], TransactionAbc[MockFeeCollectorTarget]]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/targets/fee/fee.sol#8)

        Args:
            a_: address
        """
        return cls._deploy(request_type, [a_], return_tx, MockFeeCollectorTarget, from_, value, gas_limit, {}, chain, gas_price, max_fee_per_gas, max_priority_fee_per_gas, access_list, type, block, confirmations)

    @classmethod
    def get_creation_code(cls) -> bytes:
        return cls._get_creation_code({})

    @overload
    def changeFeeCollector(self, newFeeCollectorTarget_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["call"], gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> None:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/targets/fee/fee.sol#12)

        Args:
            newFeeCollectorTarget_: address
        """
        ...

    @overload
    def changeFeeCollector(self, newFeeCollectorTarget_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["estimate"], gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> int:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/targets/fee/fee.sol#12)

        Args:
            newFeeCollectorTarget_: address
        """
        ...

    @overload
    def changeFeeCollector(self, newFeeCollectorTarget_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["access_list"], gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Tuple[Dict[Address, List[int]], int]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/targets/fee/fee.sol#12)

        Args:
            newFeeCollectorTarget_: address
        """
        ...

    @overload
    def changeFeeCollector(self, newFeeCollectorTarget_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["tx"] = "tx", gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> TransactionAbc[None]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/targets/fee/fee.sol#12)

        Args:
            newFeeCollectorTarget_: address
        """
        ...

    def changeFeeCollector(self, newFeeCollectorTarget_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: RequestType = 'tx', gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Union[None, TransactionAbc[None], int, Tuple[Dict[Address, List[int]], int]]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/targets/fee/fee.sol#12)

        Args:
            newFeeCollectorTarget_: address
        """
        return self._execute(self.chain, request_type, "9245290d", [newFeeCollectorTarget_], True if request_type == "tx" else False, NoneType, from_, to if to is not None else str(self.address), value, gas_limit, gas_price, max_fee_per_gas, max_priority_fee_per_gas, access_list, type, block, confirmations)

    @overload
    def lockFeeCollector(self, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["call"], gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> None:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/targets/fee/fee.sol#18)
        """
        ...

    @overload
    def lockFeeCollector(self, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["estimate"], gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> int:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/targets/fee/fee.sol#18)
        """
        ...

    @overload
    def lockFeeCollector(self, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["access_list"], gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Tuple[Dict[Address, List[int]], int]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/targets/fee/fee.sol#18)
        """
        ...

    @overload
    def lockFeeCollector(self, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["tx"] = "tx", gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> TransactionAbc[None]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/targets/fee/fee.sol#18)
        """
        ...

    def lockFeeCollector(self, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: RequestType = 'tx', gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Union[None, TransactionAbc[None], int, Tuple[Dict[Address, List[int]], int]]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/targets/fee/fee.sol#18)
        """
        return self._execute(self.chain, request_type, "72521dcd", [], True if request_type == "tx" else False, NoneType, from_, to if to is not None else str(self.address), value, gas_limit, gas_price, max_fee_per_gas, max_priority_fee_per_gas, access_list, type, block, confirmations)

MockFeeCollectorTarget.changeFeeCollector.selector = b'\x92E)\r'
MockFeeCollectorTarget.lockFeeCollector.selector = b'rR\x1d\xcd'
