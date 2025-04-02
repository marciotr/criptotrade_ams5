public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

     public UserDTO RegisterUser(UserDTO userDto)
    {
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(userDto.Password);

        var user = new User 
        {
            Name = userDto.Name, 
            Email = userDto.Email, 
            Phone = userDto.Phone,
            Address = userDto.Address,
            Password = hashedPassword,
            Photo = userDto.Photo
        };
        _userRepository.Add(user);

        return new UserDTO
        {
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone,
            Address = user.Address,
            Password = user.Password,
            Photo = user.Photo
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
            Photo = user.Photo
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
            Photo = user.Photo
        }).ToList();
    }

    public UserDTO? UpdateUser(int id, UserDTO userDto)
    {
<<<<<<< HEAD
=======
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(userDto.Password);
>>>>>>> 1eca3b2d26f6e3c41c581351e076587792c19d9f
        var user = _userRepository.GetById(id);
        if (user == null) return null;
        
        user.Name = userDto.Name;
        user.Email = userDto.Email;
        user.Phone = userDto.Phone;
        user.Address = userDto.Address;
<<<<<<< HEAD
        user.Photo = userDto.Photo;

        if (!string.IsNullOrEmpty(userDto.Password))
        {
            user.Password = BCrypt.Net.BCrypt.HashPassword(userDto.Password);
        }
=======
        user.Password = hashedPassword;
        user.Photo = userDto.Photo;
>>>>>>> 1eca3b2d26f6e3c41c581351e076587792c19d9f
        
        _userRepository.Update(user);
        
        return new UserDTO
        {
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone,
            Address = user.Address,
            Password = user.Password,
            Photo = user.Photo
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
            Photo = user.Photo
        };
    }

}