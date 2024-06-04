// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts-upgradeable/access/AccessControlDefaultAdminRulesUpgradeable.sol";

/**
 * @title AccessControlLockableInitializable
 * @notice this contract extends the OpenZeppelin AccessControlDefaultAdminRulesUpgradeable contract
 * to add the ability to lock roles such that they can never be changed again
 * this contract also overrides the default grant and revoke role functions to
 * allow only one account per role.
 */
abstract contract AccessControlLockableInitializable is
    AccessControlDefaultAdminRulesUpgradeable
{
    struct RoleStats {
        bool locked;
        address member;
    }

    mapping(bytes32 => RoleStats) internal _role_stats;

    error RoleIsLocked(bytes32 role);

    error RoleCanOnlyBeGrantedToOneAccount(bytes32 role);

    event RoleLocked(bytes32 role);

    modifier onlyAdmin() {
        _checkRole(DEFAULT_ADMIN_ROLE);
        _;
    }

    function __AccessControlLockableInitializable_init(
        address admin_
    ) internal onlyInitializing {
        __AccessControlDefaultAdminRules_init_unchained(0, admin_);
        __AccessControlLockable_init_unchained(admin_);
    }

    function __AccessControlLockable_init_unchained(
        address admin_
    ) internal onlyInitializing {}

    /**
     * @dev view function to get address with speicified role
     * @param role_ keccak256 hash of role name
     */
    function getRoleMember(bytes32 role_) public view returns (address) {
        return _role_stats[role_].member;
    }

    /**
     * @dev view function to check if a role is locked
     * @param role_ keccak256 hash of role name
     */
    function isLocked(bytes32 role_) public view returns (bool) {
        return _isLocked(role_);
    }

    /**
     * @dev this is a internal view function to check if a role is locked
     * @param role keccak256 hash of role name
     */
    function _isLocked(bytes32 role) internal view returns (bool) {
        return _role_stats[role].locked;
    }

    /**
     * @dev this function overrides the default grant role function to add role stats
     * to control role locking, and allows only one account per role
     * @param role_ keccak256 hash of role name
     * @param account address to grant role to
     */
    function _grantRole(
        bytes32 role_,
        address account
    ) internal override(AccessControlDefaultAdminRulesUpgradeable) {
        if (_isLocked(role_)) {
            revert RoleIsLocked(role_);
        }
        _role_stats[role_].member = account;
        super._grantRole(role_, account);
    }

    /**
     * @dev this function overrides the default revoke role function to add role stats
     * to control role locking, and allows only one account per role
     * @param role_ keccak256 hash of role name
     * @param account_ address to revoke role from
     */
    function _revokeRole(
        bytes32 role_,
        address account_
    ) internal override(AccessControlDefaultAdminRulesUpgradeable) {
        if (_isLocked(role_)) {
            revert RoleIsLocked(role_);
        }
        super._revokeRole(role_, account_);
        delete _role_stats[role_];
    }

    /**
     * @dev allows the default admin to lock a role such that it can never be changed again
     * @param role_ keccak256 hash of role name
     */
    function _lockRole(bytes32 role_) internal {
        _role_stats[role_].locked = true;
        emit RoleLocked(role_);
    }

    /**
     *
     * @dev this function override turns off the ability to renounce roles
     */
    function renounceRole(
        bytes32,
        address
    ) public pure override(AccessControlDefaultAdminRulesUpgradeable) {
        revert("renounceRole is disabled");
    }

    function grantRole(
        bytes32,
        address
    ) public pure override(AccessControlDefaultAdminRulesUpgradeable) {
        revert("grantRole is disabled");
    }

    function revokeRole(
        bytes32,
        address
    ) public pure override(AccessControlDefaultAdminRulesUpgradeable) {
        revert("revokeRole is disabled");
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[49] private __gap;
}
