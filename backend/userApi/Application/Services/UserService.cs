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
            Role = userDto.Role ?? "user"
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
            Role = user.Role
        };
    }

    public UserDTO? GetUserDetails(int id)
    {
        var user = _userRepository.GetById(id);
        return user != null ? new UserDTO 
        { 
            Name = user.Name, 
            Email = user.Email,
            Phone = user.Phone,
            Address = user.Address,
            Password = user.Password,
            Photo = user.Photo,
            Role = user.Role
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
            Password = user.Password,
            Photo = user.Photo,
            Role = user.Role
        }).ToList();
    }

    public UserDTO? UpdateUser(int id, UserDTO userDto)
    {
        var user = _userRepository.GetById(id);
        if (user == null) return null;
        
        user.Name = userDto.Name ?? user.Name;
        user.Email = userDto.Email ?? user.Email;
        user.Phone = userDto.Phone ?? user.Phone;
        user.Address = userDto.Address ?? user.Address;
        user.Role = userDto.Role ?? user.Role;
        
        // Pra atualizar a senha apenas se uma nova senha for inserida pelo user
        if (!string.IsNullOrEmpty(userDto.Password))
        {
            user.Password = BCrypt.Net.BCrypt.HashPassword(userDto.Password);
        }
        
        // mesma coisa pra foto
        if (!string.IsNullOrEmpty(userDto.Photo))
        {
            user.Photo = userDto.Photo;
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
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone,
            Address = user.Address,
            Photo = user.Photo,
            Role = user.Role
        };
    }

}