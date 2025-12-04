public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public UserDTO RegisterUser(UserDTO userDto)
    {
        var user = new User
        {
            Name = userDto.Name,
            Email = userDto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(userDto.Password),
            Phone = userDto.Phone ?? "", 
            Address = userDto.Address ?? "",
            Photo = userDto.Photo ?? "",
                Role = userDto.Role ?? "user",
                MfaEnabled = userDto.MfaEnabled,
                MfaType = userDto.MfaType
        };
        
        _userRepository.Add(user);
        
        return new UserDTO
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone,
            Address = user.Address,
            Photo = user.Photo,
            Role = user.Role,
            MfaEnabled = user.MfaEnabled,
            MfaType = user.MfaType
        };
    }

    public UserDTO? GetUserDetails(int id)
    {
        var user = _userRepository.GetById(id);
        return user != null ? new UserDTO 
        { 
            Id = user.Id,  
            Name = user.Name, 
            Email = user.Email,
            Phone = user.Phone,
            Address = user.Address,
            Photo = user.Photo,
                Role = user.Role,
                MfaEnabled = user.MfaEnabled,
                MfaType = user.MfaType
        } : null;
    }

    public List<UserDTO> GetAllUsers()
    {
        return _userRepository.GetAll().Select(user => new UserDTO
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone,
            Address = user.Address,
            Photo = user.Photo,
            Role = user.Role,
            MfaEnabled = user.MfaEnabled,
            MfaType = user.MfaType
        }).ToList();
    }

    public UserDTO? UpdateUser(int id, UserDTO userDto)
    {
        var user = _userRepository.GetById(id);
        if (user == null) return null;
        
        // Atualizar campos somente se não forem nulos
        if (userDto.Name != null) user.Name = userDto.Name;
        if (userDto.Email != null) user.Email = userDto.Email;
        if (userDto.Phone != null) user.Phone = userDto.Phone;
        if (userDto.Address != null) user.Address = userDto.Address;
        if (userDto.Role != null) user.Role = userDto.Role;
        
        // Log mais detalhado para debug de senha
        Console.WriteLine($"Password na UserDTO: {(userDto.Password != null ? "Presente" : "Null")}");
        
        if (!string.IsNullOrEmpty(userDto.Password))
        {
            Console.WriteLine("Atualizando senha do usuário");
            user.Password = BCrypt.Net.BCrypt.HashPassword(userDto.Password);
        }
        else
        {
            Console.WriteLine("Senha não fornecida, mantendo a senha atual");
        }
        
        if (!string.IsNullOrEmpty(userDto.Photo))
        {
            user.Photo = userDto.Photo;
        }
        user.MfaEnabled = userDto.MfaEnabled;
        if (!string.IsNullOrEmpty(userDto.MfaType))
        {
            user.MfaType = userDto.MfaType;
        }
        
        _userRepository.Update(user);
        
        return new UserDTO {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone,
            Address = user.Address,
            Photo = user.Photo,
            Role = user.Role 
        };
    }

    public bool DeleteUser(int id)
    {
        var user = _userRepository.GetById(id);
        if (user == null) return false;
        _userRepository.Delete(id);
        return true;
    }

    public UserDTO? ValidateUser(string email, string password)
    {
        var user = _userRepository.GetByEmail(email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.Password))
            return null;

        return new UserDTO
        {
            Id = user.Id, 
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone,
            Address = user.Address,
            Photo = user.Photo,
            Role = user.Role,
            MfaEnabled = user.MfaEnabled,
            MfaType = user.MfaType
        };
    }

}