export default defineNuxtRouteMiddleware((to, from) => {
    if (process.client) {
        const userDataStr = localStorage.getItem('userData');

        if (!userDataStr) {
            return navigateTo('/');
        }

        try {
            const userData = JSON.parse(userDataStr);
            // Check if role is admin (case insensitive safety)
            const role = (userData.role || '').toLowerCase();

            if (role !== 'admin') {
                return navigateTo('/');
            }
        } catch (e) {
            // If parsing fails, redirect for safety
            return navigateTo('/');
        }
    }
});
