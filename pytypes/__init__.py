
import woke.development.core
from woke.utils import get_package_version

if get_package_version("woke") != "3.4.2":
    raise RuntimeError("Pytypes generated for a different version of woke. Please regenerate.")

woke.development.core.errors = {b'\x08\xc3y\xa0': {'': ('woke.development.transactions', ('Error',))}, b'NH{q': {'': ('woke.development.transactions', ('Panic',))}, b'\xc3\x13\xd7\x9b': {'contracts/common/access/roles/burner/burner.sol:BurnerRole': ('pytypes.contracts.common.access.roles.burner.burner', ('BurnerRole', 'BurnerLocked')), 'contracts/mocks/common/roles/burner/burner.sol:MockBurner': ('pytypes.contracts.common.access.roles.burner.burner', ('BurnerRole', 'BurnerLocked'))}, b'\xf0\x19\xb1\xaf': {'contracts/common/access/roles/burner/burner.sol:BurnerRole': ('pytypes.contracts.common.access.roles.burner.burner', ('BurnerRole', 'NotBurner')), 'contracts/mocks/common/roles/burner/burner.sol:MockBurner': ('pytypes.contracts.common.access.roles.burner.burner', ('BurnerRole', 'NotBurner'))}, b'\x16\x8c2\x9e': {'contracts/common/access/roles/fee/fee.sol:FeeCollectorRole': ('pytypes.contracts.common.access.roles.fee.fee', ('FeeCollectorRole', 'FeeCollectorLocked')), 'contracts/mocks/common/targets/fee/fee.sol:MockFeeCollectorTarget': ('pytypes.contracts.common.access.roles.fee.fee', ('FeeCollectorRole', 'FeeCollectorLocked'))}, b'\x02\x05\xca\x99': {'contracts/common/access/roles/fee/fee.sol:FeeCollectorRole': ('pytypes.contracts.common.access.roles.fee.fee', ('FeeCollectorRole', 'NotFeeCollector')), 'contracts/mocks/common/targets/fee/fee.sol:MockFeeCollectorTarget': ('pytypes.contracts.common.access.roles.fee.fee', ('FeeCollectorRole', 'NotFeeCollector'))}, b'\x19$\x17\xb3': {'contracts/common/access/roles/minter/minter.sol:MinterRole': ('pytypes.contracts.common.access.roles.minter.minter', ('MinterRole', 'MinterLocked')), 'contracts/mocks/common/roles/minter/minter.sol:MockMinter': ('pytypes.contracts.common.access.roles.minter.minter', ('MinterRole', 'MinterLocked'))}, b'\xf8\xd2\x90l': {'contracts/common/access/roles/minter/minter.sol:MinterRole': ('pytypes.contracts.common.access.roles.minter.minter', ('MinterRole', 'NotMinter')), 'contracts/mocks/common/roles/minter/minter.sol:MockMinter': ('pytypes.contracts.common.access.roles.minter.minter', ('MinterRole', 'NotMinter'))}, b'|!O\x04': {'contracts/common/access/roles/operator/operator.sol:OperatorRole': ('pytypes.contracts.common.access.roles.operator.operator', ('OperatorRole', 'NotOperator'))}, b'\x87\x11 \x88': {'contracts/common/access/roles/operator/operator.sol:OperatorRole': ('pytypes.contracts.common.access.roles.operator.operator', ('OperatorRole', 'OperatorLocked'))}, b'\x81\x0c\x81+': {'contracts/common/tooling/deployment/deployer/deployer.sol:CreateFactory': ('pytypes.contracts.common.tooling.deployment.deployer.deployer', ('CreateFactory', 'CreateEmptyBytecode'))}, b'\xa1\x0e9\xc1': {'contracts/common/tooling/deployment/deployer/deployer.sol:CreateFactory': ('pytypes.contracts.common.tooling.deployment.deployer.deployer', ('CreateFactory', 'CreateFailedDeployment'))}, b'\x18\xbb\x8b$': {'contracts/common/tooling/deployment/deployer/deployer.sol:CreateFactory': ('pytypes.contracts.common.tooling.deployment.deployer.deployer', ('CreateFactory', 'CreateInsufficientBalance'))}}
woke.development.core.events = {b'\xfd:H\xd6\x10*\xb4\x88-X\xad\xa1L\xa5\x980\n\x1b\xf5\x8fT^R\xe9\x06~\xad\xd0\x99\xb8\x0f;': {'contracts/common/access/roles/burner/burner.sol:BurnerRole': ('pytypes.contracts.common.access.roles.burner.burner', ('BurnerRole', 'BurnerChange')), 'contracts/mocks/common/roles/burner/burner.sol:MockBurner': ('pytypes.contracts.common.access.roles.burner.burner', ('BurnerRole', 'BurnerChange'))}, b'9\x08\xccH\x01\xf6\x8d5JN(\xf5\x98\xec\x87\x87\x0fK\x8aK\x9a\x94\\\x81\xb6A\xd1\xb6wW]R': {'contracts/common/access/roles/fee/fee.sol:FeeCollectorRole': ('pytypes.contracts.common.access.roles.fee.fee', ('FeeCollectorRole', 'FeeCollectorChange')), 'contracts/mocks/common/targets/fee/fee.sol:MockFeeCollectorTarget': ('pytypes.contracts.common.access.roles.fee.fee', ('FeeCollectorRole', 'FeeCollectorChange'))}, b'\xa6\x9b\xfe\x07\x9e\xda\xcer\x18\x03gK\xf6\x05\xfcX!\x90\xb3\xa8\xbb\xda#\x02\x1d\xf3\x18\x88\xcc\x03\xeb\xfd': {'contracts/common/access/roles/minter/minter.sol:MinterRole': ('pytypes.contracts.common.access.roles.minter.minter', ('MinterRole', 'MinterChange')), 'contracts/mocks/common/roles/minter/minter.sol:MockMinter': ('pytypes.contracts.common.access.roles.minter.minter', ('MinterRole', 'MinterChange'))}, b'\xbdw\x10\xa0<\x18\n\x8b\x18;@\xb7\xbb"S&]\xc1\x9f\x8a)=\xc6\xcc\xc6\x01\xbez\xe5@\xe5T': {'contracts/common/access/roles/operator/operator.sol:OperatorRole': ('pytypes.contracts.common.access.roles.operator.operator', ('OperatorRole', 'OperatorChange'))}}
woke.development.core.contracts_by_fqn = {'@openzeppelin/contracts/utils/Address.sol:Address': ('pytypes.openzeppelin.contracts.utils.Address', ('Address_',)), '@openzeppelin/contracts/utils/Create2.sol:Create2': ('pytypes.openzeppelin.contracts.utils.Create2', ('Create2',)), 'contracts/common/access/roles/burner/burner.sol:BurnerRole': ('pytypes.contracts.common.access.roles.burner.burner', ('BurnerRole',)), 'contracts/common/access/roles/burner/iburner.sol:IBurnerRole': ('pytypes.contracts.common.access.roles.burner.iburner', ('IBurnerRole',)), 'contracts/common/access/roles/fee/fee.sol:FeeCollectorRole': ('pytypes.contracts.common.access.roles.fee.fee', ('FeeCollectorRole',)), 'contracts/common/access/roles/fee/ifee.sol:IFeeCollectorRole': ('pytypes.contracts.common.access.roles.fee.ifee', ('IFeeCollectorRole',)), 'contracts/common/access/roles/minter/iminter.sol:IMinterRole': ('pytypes.contracts.common.access.roles.minter.iminter', ('IMinterRole',)), 'contracts/common/access/roles/minter/minter.sol:MinterRole': ('pytypes.contracts.common.access.roles.minter.minter', ('MinterRole',)), 'contracts/common/access/roles/operator/ioperator.sol:IOperatorRole': ('pytypes.contracts.common.access.roles.operator.ioperator', ('IOperatorRole',)), 'contracts/common/access/roles/operator/operator.sol:OperatorRole': ('pytypes.contracts.common.access.roles.operator.operator', ('OperatorRole',)), 'contracts/common/tooling/deployment/deployer/deployer.sol:CreateFactory': ('pytypes.contracts.common.tooling.deployment.deployer.deployer', ('CreateFactory',)), 'contracts/common/tooling/deployment/factory/factory.sol:GenericFactory': ('pytypes.contracts.common.tooling.deployment.factory.factory', ('GenericFactory',)), 'contracts/mocks/common/roles/burner/burner.sol:MockBurner': ('pytypes.contracts.mocks.common.roles.burner.burner', ('MockBurner',)), 'contracts/mocks/common/roles/minter/minter.sol:MockMinter': ('pytypes.contracts.mocks.common.roles.minter.minter', ('MockMinter',)), 'contracts/mocks/common/targets/fee/fee.sol:MockFeeCollectorTarget': ('pytypes.contracts.mocks.common.targets.fee.fee', ('MockFeeCollectorTarget',))}
woke.development.core.contracts_by_metadata = {b'\xa2dipfsX"\x12 \xa6\x08\x14w\xa1;\x10\x05-&\xe4\x83\xc9\x1a\xdb\x10\xbd\x8d\x8a\x81\x18\'~\xf1G^)\xd8\x83\x8d\xfa\x16dsolcC\x00\x08\x14\x003': '@openzeppelin/contracts/utils/Address.sol:Address', b'\xa2dipfsX"\x12 \x91?\xd4\'\xae\xe3 \x89\xfe^\x9d\xdf\xc6\xc4_\x01\xef\xd7\xd3=\xee\xa2\x92\xb2\x7f\xa1\xe1\xb7\xb5-\r~dsolcC\x00\x08\x14\x003': '@openzeppelin/contracts/utils/Create2.sol:Create2', b'\xa2dipfsX"\x12 \x01\x93\x92\x0c&\x0e\xbc\xba\xd6e\xac\xb7]\xb9<\xe4b\xc2\xae\xef\xd6\xd2\x05\xdb!\x1d\x81 w\x81\x91\x10dsolcC\x00\x08\x14\x003': 'contracts/common/access/roles/fee/fee.sol:FeeCollectorRole', b'\xa2dipfsX"\x12 \xfc\x9av4\x86\xae\xae\xb9\xc8(\xf0s\x92\x80\x9fd\x9c\xda\x15\xfa\xe7\xc9\xea\xab6\x88\x97\x97sX\x9b\xd2dsolcC\x00\x08\x14\x003': 'contracts/common/tooling/deployment/factory/factory.sol:GenericFactory', b'\xa2dipfsX"\x12 \xc5\xc3\x9c\x8c\xba\x1a\xfe\xcc\xd9w^\x83\x809@luL\xde\x01;m;!\x87YZ/\x9d4\xb8KdsolcC\x00\x08\x14\x003': 'contracts/mocks/common/roles/burner/burner.sol:MockBurner', b'\xa2dipfsX"\x12 U\xfb\x01W\x15%\n\xf1\x11\xc1"W\xb4\x92Yp\x9c\x0e\x9c\xb1\xde\xea\xa2\xa0\n\xe5\xea(\xb1\xc8|\xb3dsolcC\x00\x08\x14\x003': 'contracts/mocks/common/roles/minter/minter.sol:MockMinter', b'\xa2dipfsX"\x12 \x03b\xbc\xbd5.\x84_\xc8\x0fy\\\x9bQ\x9f\xf2\x87\xee\xfc*\x9d\x0c\xde\xb8\xc17\x9b\x1c\xca3\x9cVdsolcC\x00\x08\x14\x003': 'contracts/mocks/common/targets/fee/fee.sol:MockFeeCollectorTarget'}
woke.development.core.contracts_inheritance = {'@openzeppelin/contracts/utils/Address.sol:Address': ('@openzeppelin/contracts/utils/Address.sol:Address',), '@openzeppelin/contracts/utils/Create2.sol:Create2': ('@openzeppelin/contracts/utils/Create2.sol:Create2',), 'contracts/common/access/roles/burner/burner.sol:BurnerRole': ('contracts/common/access/roles/burner/burner.sol:BurnerRole',), 'contracts/common/access/roles/burner/iburner.sol:IBurnerRole': ('contracts/common/access/roles/burner/iburner.sol:IBurnerRole',), 'contracts/common/access/roles/fee/fee.sol:FeeCollectorRole': ('contracts/common/access/roles/fee/fee.sol:FeeCollectorRole',), 'contracts/common/access/roles/fee/ifee.sol:IFeeCollectorRole': ('contracts/common/access/roles/fee/ifee.sol:IFeeCollectorRole',), 'contracts/common/access/roles/minter/iminter.sol:IMinterRole': ('contracts/common/access/roles/minter/iminter.sol:IMinterRole',), 'contracts/common/access/roles/minter/minter.sol:MinterRole': ('contracts/common/access/roles/minter/minter.sol:MinterRole',), 'contracts/common/access/roles/operator/ioperator.sol:IOperatorRole': ('contracts/common/access/roles/operator/ioperator.sol:IOperatorRole',), 'contracts/common/access/roles/operator/operator.sol:OperatorRole': ('contracts/common/access/roles/operator/operator.sol:OperatorRole',), 'contracts/common/tooling/deployment/deployer/deployer.sol:CreateFactory': ('contracts/common/tooling/deployment/deployer/deployer.sol:CreateFactory',), 'contracts/common/tooling/deployment/factory/factory.sol:GenericFactory': ('contracts/common/tooling/deployment/factory/factory.sol:GenericFactory',), 'contracts/mocks/common/roles/burner/burner.sol:MockBurner': ('contracts/mocks/common/roles/burner/burner.sol:MockBurner', 'contracts/common/access/roles/burner/burner.sol:BurnerRole', 'contracts/common/access/roles/burner/iburner.sol:IBurnerRole'), 'contracts/mocks/common/roles/minter/minter.sol:MockMinter': ('contracts/mocks/common/roles/minter/minter.sol:MockMinter', 'contracts/common/access/roles/minter/minter.sol:MinterRole', 'contracts/common/access/roles/minter/iminter.sol:IMinterRole'), 'contracts/mocks/common/targets/fee/fee.sol:MockFeeCollectorTarget': ('contracts/mocks/common/targets/fee/fee.sol:MockFeeCollectorTarget', 'contracts/common/access/roles/fee/fee.sol:FeeCollectorRole', 'contracts/common/access/roles/fee/ifee.sol:IFeeCollectorRole')}
woke.development.core.contracts_revert_index = {'contracts/mocks/common/roles/burner/burner.sol:MockBurner': {432, 537}, 'contracts/mocks/common/roles/minter/minter.sol:MockMinter': {432, 509}, 'contracts/mocks/common/targets/fee/fee.sol:MockFeeCollectorTarget': {355}}
woke.development.core.creation_code_index = [(((160, b'z\xfd\xcc\xd9\xec\x1f\x94\xa8\x8d)h\xdba\x18{<\xfdb\xda\xd9\xd3\x0f\xf9\xe0h[w\x95\x8fS\xee\x84'),), '@openzeppelin/contracts/utils/Address.sol:Address'), (((160, b'\x90G5\x11\xb4\x8e\xd2\xd8\x04P\xeb\xd8_\xcf^tb\x1b\xa9\n@Gq$\x94\x07\xf4\x84YVb\xf2'),), '@openzeppelin/contracts/utils/Create2.sol:Create2'), (((398, b'\x8fK\xe9\x88Z\x95\x81v\xc2*J\xecAubV\x04\xcd\'$\xe8/\x0e\xa4i\xc1\x0c\x16"<\n\xb1'),), 'contracts/common/access/roles/fee/fee.sol:FeeCollectorRole'), (((879, b'\x19\xbe\xe5\xfc\xef\xf3JX\xba\x01tyX\\\xe3#HoeM\xcc\xce(\xa0\xfa\xc5E\xd2\xd2k\xf1\x91'),), 'contracts/common/tooling/deployment/factory/factory.sol:GenericFactory'), (((1392, b"\xac{y\xb0?\xee#R\xe6\xe6O\xdf4\x0b\xce\xb9\x90x\xb9\x93+\xff\xe8L\xeb\x0b'\xac\x05HT5"),), 'contracts/mocks/common/roles/burner/burner.sol:MockBurner'), (((1392, b'\x82\xf0\xc5t4[YY6\x16.\xfc\xd4\x17*\xec\xe0\xda\xfd`\xae\xb3\x9e\x0e\xd0[\xf3\x9b/C\xe0\xca'),), 'contracts/mocks/common/roles/minter/minter.sol:MockMinter'), (((1210, b'&\xc8\x1a\xdc&\xb8\xe5\xbd\x9c\x13\xb1\x18\x80`\xce[\xd6\xe7\xad\xd5\xa3\xf4\xfc\xc5\x100i\x13\x17\xe6\x879'),), 'contracts/mocks/common/targets/fee/fee.sol:MockFeeCollectorTarget')]