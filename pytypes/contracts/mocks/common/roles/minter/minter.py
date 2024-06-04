
from __future__ import annotations

import dataclasses
from typing import List, Dict, Optional, overload, Union, Callable, Tuple
from typing_extensions import Literal

from woke.development.core import Contract, Library, Address, Account, Chain, RequestType
from woke.development.primitive_types import *
from woke.development.transactions import TransactionAbc, TransactionRevertedError

from enum import IntEnum

from pytypes.contracts.common.access.roles.minter.iminter import IMinterRole
from pytypes.contracts.common.access.roles.minter.minter import MinterRole



class MockMinter(MinterRole, IMinterRole):
    """
    [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#7)
    """
    _abi = {'constructor': {'inputs': [{'internalType': 'address', 'name': 'a_', 'type': 'address'}], 'stateMutability': 'nonpayable', 'type': 'constructor'}, b',MM\x18': {'inputs': [{'internalType': 'address', 'name': 'newMinter_', 'type': 'address'}], 'name': 'changeMinter', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function'}, b'v\xda\xeb\xe1': {'inputs': [], 'name': 'lockMinter', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function'}, b'\x07Tar': {'inputs': [], 'name': 'minter', 'outputs': [{'internalType': 'address', 'name': '', 'type': 'address'}], 'stateMutability': 'view', 'type': 'function'}, b'k\xa0\x99`': {'inputs': [], 'name': 'minterIsLocked', 'outputs': [{'internalType': 'bool', 'name': '', 'type': 'bool'}], 'stateMutability': 'view', 'type': 'function'}, b'\x83M\x81\x85': {'inputs': [], 'name': 'protected', 'outputs': [{'internalType': 'bool', 'name': '', 'type': 'bool'}], 'stateMutability': 'view', 'type': 'function'}}
    _creation_code = "608060405234801561000f575f80fd5b5060405161057038038061057083398181016040528101906100319190610163565b6100408161004660201b60201c565b506101b6565b5f60149054906101000a900460ff161561008c576040517f192417b300000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b805f806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507fa69bfe079edace721803674bf605fc582190b3a8bbda23021df31888cc03ebfd816040516100fa919061019d565b60405180910390a150565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61013282610109565b9050919050565b61014281610128565b811461014c575f80fd5b50565b5f8151905061015d81610139565b92915050565b5f6020828403121561017857610177610105565b5b5f6101858482850161014f565b91505092915050565b61019781610128565b82525050565b5f6020820190506101b05f83018461018e565b92915050565b6103ad806101c35f395ff3fe608060405234801561000f575f80fd5b5060043610610055575f3560e01c806307546172146100595780632c4d4d18146100775780636ba099601461009357806376daebe1146100b1578063834d8185146100bb575b5f80fd5b6100616100d9565b60405161006e91906102d2565b60405180910390f35b610091600480360381019061008c9190610319565b610100565b005b61009b61010c565b6040516100a8919061035e565b60405180910390f35b6100b9610121565b005b6100c361012b565b6040516100d0919061035e565b60405180910390f35b5f805f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b610109816101b8565b50565b5f8060149054906101000a900460ff16905090565b610129610277565b565b5f805f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146101b1576040517ff8d2906c00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6001905090565b5f60149054906101000a900460ff16156101fe576040517f192417b300000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b805f806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507fa69bfe079edace721803674bf605fc582190b3a8bbda23021df31888cc03ebfd8160405161026c91906102d2565b60405180910390a150565b60015f60146101000a81548160ff021916908315150217905550565b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6102bc82610293565b9050919050565b6102cc816102b2565b82525050565b5f6020820190506102e55f8301846102c3565b92915050565b5f80fd5b6102f8816102b2565b8114610302575f80fd5b50565b5f81359050610313816102ef565b92915050565b5f6020828403121561032e5761032d6102eb565b5b5f61033b84828501610305565b91505092915050565b5f8115159050919050565b61035881610344565b82525050565b5f6020820190506103715f83018461034f565b9291505056fea264697066735822122055fb015715250af111c12257b49259709c0e9cb1deeaa2a00ae5ea28b1c87cb364736f6c63430008140033"

    @overload
    @classmethod
    def deploy(cls, a_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, return_tx: Literal[False] = False, request_type: Literal["call"], chain: Optional[Chain] = None, gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> bytearray:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#8)

        Args:
            a_: address
        """
        ...

    @overload
    @classmethod
    def deploy(cls, a_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, return_tx: Literal[False] = False, request_type: Literal["tx"] = "tx", chain: Optional[Chain] = None, gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> MockMinter:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#8)

        Args:
            a_: address
        """
        ...

    @overload
    @classmethod
    def deploy(cls, a_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, return_tx: Literal[False] = False, request_type: Literal["estimate"], chain: Optional[Chain] = None, gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> int:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#8)

        Args:
            a_: address
        """
        ...

    @overload
    @classmethod
    def deploy(cls, a_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, return_tx: Literal[False] = False, request_type: Literal["access_list"], chain: Optional[Chain] = None, gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Tuple[Dict[Address, List[int]], int]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#8)

        Args:
            a_: address
        """
        ...

    @overload
    @classmethod
    def deploy(cls, a_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, return_tx: Literal[True], request_type: Literal["tx"] = "tx", chain: Optional[Chain] = None, gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> TransactionAbc[MockMinter]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#8)

        Args:
            a_: address
        """
        ...

    @classmethod
    def deploy(cls, a_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, return_tx: bool = False, request_type: RequestType = "tx", chain: Optional[Chain] = None, gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Union[bytearray, MockMinter, int, Tuple[Dict[Address, List[int]], int], TransactionAbc[MockMinter]]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#8)

        Args:
            a_: address
        """
        return cls._deploy(request_type, [a_], return_tx, MockMinter, from_, value, gas_limit, {}, chain, gas_price, max_fee_per_gas, max_priority_fee_per_gas, access_list, type, block, confirmations)

    @classmethod
    def get_creation_code(cls) -> bytes:
        return cls._get_creation_code({})

    @overload
    def changeMinter(self, newMinter_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["call"], gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> None:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#12)

        Args:
            newMinter_: address
        """
        ...

    @overload
    def changeMinter(self, newMinter_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["estimate"], gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> int:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#12)

        Args:
            newMinter_: address
        """
        ...

    @overload
    def changeMinter(self, newMinter_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["access_list"], gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Tuple[Dict[Address, List[int]], int]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#12)

        Args:
            newMinter_: address
        """
        ...

    @overload
    def changeMinter(self, newMinter_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["tx"] = "tx", gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> TransactionAbc[None]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#12)

        Args:
            newMinter_: address
        """
        ...

    def changeMinter(self, newMinter_: Union[Account, Address], *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: RequestType = 'tx', gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Union[None, TransactionAbc[None], int, Tuple[Dict[Address, List[int]], int]]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#12)

        Args:
            newMinter_: address
        """
        return self._execute(self.chain, request_type, "2c4d4d18", [newMinter_], True if request_type == "tx" else False, NoneType, from_, to if to is not None else str(self.address), value, gas_limit, gas_price, max_fee_per_gas, max_priority_fee_per_gas, access_list, type, block, confirmations)

    @overload
    def lockMinter(self, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["call"], gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> None:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#16)
        """
        ...

    @overload
    def lockMinter(self, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["estimate"], gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> int:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#16)
        """
        ...

    @overload
    def lockMinter(self, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["access_list"], gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Tuple[Dict[Address, List[int]], int]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#16)
        """
        ...

    @overload
    def lockMinter(self, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["tx"] = "tx", gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> TransactionAbc[None]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#16)
        """
        ...

    def lockMinter(self, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: RequestType = 'tx', gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Union[None, TransactionAbc[None], int, Tuple[Dict[Address, List[int]], int]]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#16)
        """
        return self._execute(self.chain, request_type, "76daebe1", [], True if request_type == "tx" else False, NoneType, from_, to if to is not None else str(self.address), value, gas_limit, gas_price, max_fee_per_gas, max_priority_fee_per_gas, access_list, type, block, confirmations)

    @overload
    def protected(self, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["call"] = "call", gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> bool:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#20)

        Returns:
            bool
        """
        ...

    @overload
    def protected(self, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["estimate"], gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> int:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#20)

        Returns:
            bool
        """
        ...

    @overload
    def protected(self, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["access_list"], gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Tuple[Dict[Address, List[int]], int]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#20)

        Returns:
            bool
        """
        ...

    @overload
    def protected(self, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["tx"], gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> TransactionAbc[bool]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#20)

        Returns:
            bool
        """
        ...

    def protected(self, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: RequestType = 'call', gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Union[bool, TransactionAbc[bool], int, Tuple[Dict[Address, List[int]], int]]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/mocks/common/roles/minter/minter.sol#20)

        Returns:
            bool
        """
        return self._execute(self.chain, request_type, "834d8185", [], True if request_type == "tx" else False, bool, from_, to if to is not None else str(self.address), value, gas_limit, gas_price, max_fee_per_gas, max_priority_fee_per_gas, access_list, type, block, confirmations)

MockMinter.changeMinter.selector = b',MM\x18'
MockMinter.lockMinter.selector = b'v\xda\xeb\xe1'
MockMinter.protected.selector = b'\x83M\x81\x85'
