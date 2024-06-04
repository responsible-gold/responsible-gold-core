
from __future__ import annotations

import dataclasses
from typing import List, Dict, Optional, overload, Union, Callable, Tuple
from typing_extensions import Literal

from woke.development.core import Contract, Library, Address, Account, Chain, RequestType
from woke.development.primitive_types import *
from woke.development.transactions import TransactionAbc, TransactionRevertedError

from enum import IntEnum



class GenericFactory(Contract):
    """
    [Source code](file:///home/et3p0/projects/q-contracts/contracts/common/tooling/deployment/factory/factory.sol#6)
    """
    _abi = {'constructor': {'inputs': [], 'stateMutability': 'nonpayable', 'type': 'constructor'}, b'\xc9\x94\xa3\x90': {'inputs': [{'internalType': 'string', 'name': 'symbol_', 'type': 'string'}], 'name': 'addressFor', 'outputs': [{'internalType': 'address', 'name': 'addr', 'type': 'address'}], 'stateMutability': 'view', 'type': 'function'}}
    _creation_code = "60a060405234801561000f575f80fd5b5061001e61003160201b60201c565b8051906020012060808181525050610036565b606090565b60805161032261004d5f395f60c501526103225ff3fe608060405234801561000f575f80fd5b5060043610610029575f3560e01c8063c994a3901461002d575b5f80fd5b610047600480360381019061004291906101c7565b61005d565b6040516100549190610251565b60405180910390f35b5f6100aa83838080601f0160208091040260200160405190810160405280939291908181526020018383808284375f81840152601f19601f820116905080830192505050505050506100b2565b905092915050565b5f806100bd836100f1565b90506100e9817f0000000000000000000000000000000000000000000000000000000000000000610120565b915050919050565b5f8160405160200161010391906102d6565b604051602081830303815290604052805190602001209050919050565b5f61012c838330610134565b905092915050565b5f604051836040820152846020820152828152600b810160ff815360558120925050509392505050565b5f80fd5b5f80fd5b5f80fd5b5f80fd5b5f80fd5b5f8083601f84011261018757610186610166565b5b8235905067ffffffffffffffff8111156101a4576101a361016a565b5b6020830191508360018202830111156101c0576101bf61016e565b5b9250929050565b5f80602083850312156101dd576101dc61015e565b5b5f83013567ffffffffffffffff8111156101fa576101f9610162565b5b61020685828601610172565b92509250509250929050565b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61023b82610212565b9050919050565b61024b81610231565b82525050565b5f6020820190506102645f830184610242565b92915050565b5f81519050919050565b5f81905092915050565b5f5b8381101561029b578082015181840152602081019050610280565b5f8484015250505050565b5f6102b08261026a565b6102ba8185610274565b93506102ca81856020860161027e565b80840191505092915050565b5f6102e182846102a6565b91508190509291505056fea2646970667358221220fc9a763486aeaeb9c828f07392809f649cda15fae7c9eaab3688979773589bd264736f6c63430008140033"

    @overload
    @classmethod
    def deploy(cls, *, from_: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, return_tx: Literal[False] = False, request_type: Literal["call"], chain: Optional[Chain] = None, gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> bytearray:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/common/tooling/deployment/factory/factory.sol#9)
        """
        ...

    @overload
    @classmethod
    def deploy(cls, *, from_: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, return_tx: Literal[False] = False, request_type: Literal["tx"] = "tx", chain: Optional[Chain] = None, gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> GenericFactory:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/common/tooling/deployment/factory/factory.sol#9)
        """
        ...

    @overload
    @classmethod
    def deploy(cls, *, from_: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, return_tx: Literal[False] = False, request_type: Literal["estimate"], chain: Optional[Chain] = None, gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> int:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/common/tooling/deployment/factory/factory.sol#9)
        """
        ...

    @overload
    @classmethod
    def deploy(cls, *, from_: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, return_tx: Literal[False] = False, request_type: Literal["access_list"], chain: Optional[Chain] = None, gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Tuple[Dict[Address, List[int]], int]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/common/tooling/deployment/factory/factory.sol#9)
        """
        ...

    @overload
    @classmethod
    def deploy(cls, *, from_: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, return_tx: Literal[True], request_type: Literal["tx"] = "tx", chain: Optional[Chain] = None, gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> TransactionAbc[GenericFactory]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/common/tooling/deployment/factory/factory.sol#9)
        """
        ...

    @classmethod
    def deploy(cls, *, from_: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, return_tx: bool = False, request_type: RequestType = "tx", chain: Optional[Chain] = None, gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Union[bytearray, GenericFactory, int, Tuple[Dict[Address, List[int]], int], TransactionAbc[GenericFactory]]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/common/tooling/deployment/factory/factory.sol#9)
        """
        return cls._deploy(request_type, [], return_tx, GenericFactory, from_, value, gas_limit, {}, chain, gas_price, max_fee_per_gas, max_priority_fee_per_gas, access_list, type, block, confirmations)

    @classmethod
    def get_creation_code(cls) -> bytes:
        return cls._get_creation_code({})

    @overload
    def addressFor(self, symbol_: str, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["call"] = "call", gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Address:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/common/tooling/deployment/factory/factory.sol#13)

        Args:
            symbol_: string
        Returns:
            address
        """
        ...

    @overload
    def addressFor(self, symbol_: str, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["estimate"], gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> int:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/common/tooling/deployment/factory/factory.sol#13)

        Args:
            symbol_: string
        Returns:
            address
        """
        ...

    @overload
    def addressFor(self, symbol_: str, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["access_list"], gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Tuple[Dict[Address, List[int]], int]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/common/tooling/deployment/factory/factory.sol#13)

        Args:
            symbol_: string
        Returns:
            address
        """
        ...

    @overload
    def addressFor(self, symbol_: str, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: Literal["tx"], gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> TransactionAbc[Address]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/common/tooling/deployment/factory/factory.sol#13)

        Args:
            symbol_: string
        Returns:
            address
        """
        ...

    def addressFor(self, symbol_: str, *, from_: Optional[Union[Account, Address, str]] = None, to: Optional[Union[Account, Address, str]] = None, value: Union[int, str] = 0, gas_limit: Optional[Union[int, Literal["max"], Literal["auto"]]] = None, request_type: RequestType = 'call', gas_price: Optional[Union[int, str]] = None, max_fee_per_gas: Optional[Union[int, str]] = None, max_priority_fee_per_gas: Optional[Union[int, str]] = None, access_list: Optional[Union[Dict[Union[Account, Address, str], List[int]], Literal["auto"]]] = None, type: Optional[int] = None, block: Optional[Union[int, Literal["latest"], Literal["pending"], Literal["earliest"], Literal["safe"], Literal["finalized"]]] = None, confirmations: Optional[int] = None) -> Union[Address, TransactionAbc[Address], int, Tuple[Dict[Address, List[int]], int]]:
        """
        [Source code](file:///home/et3p0/projects/q-contracts/contracts/common/tooling/deployment/factory/factory.sol#13)

        Args:
            symbol_: string
        Returns:
            address
        """
        return self._execute(self.chain, request_type, "c994a390", [symbol_], True if request_type == "tx" else False, Address, from_, to if to is not None else str(self.address), value, gas_limit, gas_price, max_fee_per_gas, max_priority_fee_per_gas, access_list, type, block, confirmations)

GenericFactory.addressFor.selector = b'\xc9\x94\xa3\x90'
