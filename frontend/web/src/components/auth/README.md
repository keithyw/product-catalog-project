# Permission-Based UI Control System

This system provides fine-grained permission and group-based access control for your React components, integrating with your Django backend permissions.

## Components

### 1. Enhanced Auth Store (`useAuthStore.ts`)
The auth store now includes:
- User data with permissions and groups
- Permission checking methods (`hasPermission`, `hasAnyPermission`)
- Group checking methods (`isInGroup`, `isInAnyGroup`)

### 2. PermissionGuard Component
A wrapper component that conditionally renders children based on permissions/groups.

```tsx
import PermissionGuard from '@/components/auth/PermissionGuard'

// Basic permission check
<PermissionGuard requiredPermission="add_user">
  <CreateUserButton />
</PermissionGuard>

// Multiple permissions (ALL required)
<PermissionGuard requiredPermissions={["add_user", "change_user"]}>
  <UserManagementPanel />
</PermissionGuard>

// Any permission (ANY required)
<PermissionGuard anyPermission={["add_user", "change_user", "delete_user"]}>
  <UserActionsMenu />
</PermissionGuard>

// Group-based access
<PermissionGuard requiredGroup="Admin">
  <AdminPanel />
</PermissionGuard>

// Staff requirement
<PermissionGuard requireStaff>
  <StaffOnlySection />
</PermissionGuard>

// With fallback content
<PermissionGuard 
  requiredPermission="view_reports"
  fallback={<div>Access denied</div>}
>
  <ReportsSection />
</PermissionGuard>

// Inverted logic (hide when user HAS permission)
<PermissionGuard requiredPermission="delete_user" invert>
  <div>You cannot delete users</div>
</PermissionGuard>
```

### 3. usePermissions Hook
A custom hook for programmatic permission checking.

```tsx
import { usePermissions } from '@/hooks/usePermissions'

function MyComponent() {
  const { 
    canCreateUser, 
    canEditUser, 
    checkAccess, 
    hasPermission,
    isInGroup 
  } = usePermissions()

  // Simple checks
  if (canCreateUser()) {
    // Show create button
  }

  // Complex checks
  const canManageUsers = checkAccess({
    anyPermission: ['add_user', 'change_user'],
    requireActive: true
  })

  // Custom logic
  const showAdvancedFeatures = hasPermission('advanced_features') || isInGroup('PowerUsers')
}
```

## Permission Constants

Use the predefined constants from `@/lib/permissions`:

```tsx
import { USER_PERMISSIONS, GROUP_PERMISSIONS, COMMON_GROUPS } from '@/lib/permissions'

<PermissionGuard requiredPermission={USER_PERMISSIONS.ADD}>
  <CreateUserButton />
</PermissionGuard>

<PermissionGuard requiredGroup={COMMON_GROUPS.ADMIN}>
  <AdminPanel />
</PermissionGuard>
```

## Integration Steps

### 1. Update Your Login Flow
After successful login, fetch and store user permissions:

```tsx
// In your login success handler
const loginSuccess = async (authResponse: AuthResponse) => {
  // Set auth tokens
  useAuthStore.getState().setLoginStatus(authResponse)
  
  // Fetch user data with permissions
  const userData = await fetchCurrentUser() // Your API call
  useAuthStore.getState().setUser(userData)
  
  // Extract and store permissions
  const allPermissions = userData.groups.flatMap(group => group.permissions || [])
  useAuthStore.getState().setUserPermissions(allPermissions)
  useAuthStore.getState().setUserGroups(userData.groups)
}
```

### 2. Update Your API Types
Ensure your User type includes groups with permissions:

```tsx
// Make sure your User type has groups with permissions
interface User {
  // ... other fields
  groups: Group[]
}

interface Group {
  // ... other fields
  permissions?: Permission[]
}
```

### 3. Protect UI Elements
Replace conditional rendering with PermissionGuard:

```tsx
// Before
{user?.is_staff && <AdminButton />}

// After
<PermissionGuard requireStaff>
  <AdminButton />
</PermissionGuard>

// Before
{canEdit && <EditButton />}

// After
<PermissionGuard requiredPermission="change_user">
  <EditButton />
</PermissionGuard>
```

## Common Patterns

### Row Actions with Permissions
```tsx
const getRowActions = (user: User): TableRowAction<User>[] => {
  const actions: TableRowAction<User>[] = []
  
  if (canViewUser()) {
    actions.push({ label: 'View', actionType: 'view', onClick: handleView })
  }
  
  if (canEditUser()) {
    actions.push({ label: 'Edit', actionType: 'edit', onClick: handleEdit })
  }
  
  if (canDeleteUser()) {
    actions.push({ label: 'Delete', actionType: 'delete', onClick: handleDelete })
  }
  
  return actions
}
```

### Conditional Navigation
```tsx
const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  ...(canViewUser() ? [{ name: 'Users', href: '/users' }] : []),
  ...(isInGroup('Admin') ? [{ name: 'Admin', href: '/admin' }] : []),
]
```

### Form Field Permissions
```tsx
<form>
  <input name="username" />
  <input name="email" />
  
  <PermissionGuard requireStaff>
    <input name="is_staff" type="checkbox" />
  </PermissionGuard>
  
  <PermissionGuard requiredPermission="change_user_groups">
    <GroupSelector />
  </PermissionGuard>
</form>
```

## Best Practices

1. **Always provide fallbacks** for better UX when access is denied
2. **Use permission constants** instead of hardcoded strings
3. **Check permissions at multiple levels** (route, component, and action)
4. **Keep permission logic close to the UI** for better maintainability
5. **Test with different user roles** to ensure proper access control
6. **Consider loading states** while permissions are being fetched

## Security Note

Remember that frontend permission checks are for UX only. Always enforce permissions on your Django backend as well. Frontend checks can be bypassed by determined users.
