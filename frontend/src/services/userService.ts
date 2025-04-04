import axios from "axios";
import {userAPI} from "./api";


export interface User {
    id?: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    password?: string;
    photo: string;
}

const fakeUser: User[] = [
    {    
        id: 1,
        name: "João da Silva",
        email: "joaodasilva@email.com",
        phone: "(15) 12312-6456",
        address: "Rua do Ninho Verde, 679",
        password: "senhaHashed",
        photo: "user.png"
    },
    {
        id: 2,
        name: "thiago da Silva",
        email: "thiagodasilva@email.com",
        phone: "(15) 12312-6456",
        address: "Rua do Ninho Vermelho, 340",
        password: "senhaHashed",
        photo: "user.png"
    }
]


const userService = {
    async getAll(): Promise<User[]>{
        const header = {
            headers:{
                'Accept': 'aplicationjson/',
                'Acess-Control-Allow-Origin': "*"
            }
        }
        const response = await axios.get(userAPI.getAll(), header);
        return response.data;
    }
}

export default userService;