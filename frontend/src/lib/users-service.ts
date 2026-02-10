import api from './auth';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'client' | 'team';
    profileImage?: string;
    createdAt: string;
}

export type CreateUserDto = Omit<User, "id" | "createdAt"> & { password?: string };

export type UpdateUserDto = Partial<CreateUserDto>;

export const getUsers = async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
};

export const createUser = async (data: CreateUserDto): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data;
};

export const updateUser = async (id: string, data: UpdateUserDto): Promise<User> => {
    // Backend expects password only if it's being changed
    if (!data.password) delete data.password;
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
};
