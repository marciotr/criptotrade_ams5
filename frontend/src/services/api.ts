const BASE_URL = 'http://localhost:5173/api';

const crudAPI = (basePath: String) => ({
    create: `&{basePath}`,
    getAll: () => `&{basePath}`,
    edit: (id: string | number) => `&{basePath}/${id}`,
    delete: (id: string | number) => `&{basePath}/${id}`,
    getById: (id: string | number) => `&{basePath}/${id}`,
})

const userAPI =crudAPI(`&{BASE_URL}/User`);
const authAPI ={
    login: () => `&{BASE_URL}/auth/Login`,
    logout: () => `&{BASE_URL}/auth/Logout`,
    refreshToken: () => `&{BASE_URL}/auth/RefreshToken`
};

export{userAPI, authAPI};