package middleware

import (
	"net/http"
)

func RBACMiddleware(allowedRoles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			roleBase := r.Context().Value(UserRoleKey)
			if roleBase == nil {
				http.Error(w, "User role not found in context", http.StatusForbidden)
				return
			}

			userRole, ok := roleBase.(string)
			if !ok {
				http.Error(w, "Invalid user role type", http.StatusForbidden)
				return
			}

			hasAccess := false
			for _, role := range allowedRoles {
				if userRole == role {
					hasAccess = true
					break
				}
			}

			if !hasAccess {
				http.Error(w, "Forbidden: insufficient permissions", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
