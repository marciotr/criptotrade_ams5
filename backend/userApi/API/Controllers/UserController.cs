using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;
using userApi.API.DTOs; 

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

     [HttpPost]
    public IActionResult RegisterUser(UserDTO userDto)
    {
        var newUser = new User 
        {
            Role = userDto.Role ?? "user" 
        };
        var result = _userService.RegisterUser(userDto);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public IActionResult GetUserDetails(int id)
    {
        var user = _userService.GetUserDetails(id);
        return user != null ? Ok(user) : NotFound();
    }

    [HttpGet]
    public IActionResult GetAllUsers()
    {
        var users = _userService.GetAllUsers();
        return Ok(users);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateUser(int id, UpdateUserDTO updateDto)
    {
        try
        {
            // Adicione logging para debug
            Console.WriteLine($"Recebendo atualização para usuário {id}");
            Console.WriteLine($"Role recebida: {updateDto.Role}");
            
            var existingUser = _userService.GetUserDetails(id);
            if (existingUser == null)
                return NotFound();
                
            if (updateDto.Name != null)
                existingUser.Name = updateDto.Name;
            
            if (updateDto.Email != null)
                existingUser.Email = updateDto.Email;
            
            if (updateDto.Phone != null)
                existingUser.Phone = updateDto.Phone;
            
            if (updateDto.Address != null)
                existingUser.Address = updateDto.Address;
                
            if (updateDto.Role != null)
            {
                Console.WriteLine($"Atualizando role para: {updateDto.Role}");
                existingUser.Role = updateDto.Role;
            }
            
            if (updateDto.Photo != null)
                existingUser.Photo = updateDto.Photo;
            
            if (updateDto.Password != null)
            {
                Console.WriteLine("Senha será atualizada");
                existingUser.Password = updateDto.Password;
            }
            
            var result = _userService.UpdateUser(id, existingUser);
            
            // Verificar se a role foi atualizada
            Console.WriteLine($"Role após atualização: {result.Role}");
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erro ao atualizar usuário: {ex.Message}");
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteUser(int id)
    {
        var result = _userService.DeleteUser(id);
        return result ? NoContent() : NotFound();
    }

    [HttpGet("{id}/photo")]
    public IActionResult GetUserPhoto(int id)
    {
        var user = _userService.GetUserDetails(id);
        if (user == null || string.IsNullOrEmpty(user.Photo))
            return NotFound();

        return Ok(new { photo = user.Photo });
    }

    [HttpPost("{id}/photo")]
    public async Task<IActionResult> UploadPhoto(int id, IFormFile photo)
    {
        if (photo == null || photo.Length == 0)
            return BadRequest("No file uploaded");

        var user = _userService.GetUserDetails(id);
        if (user == null)
            return NotFound();

        using var ms = new MemoryStream();
        await photo.CopyToAsync(ms);
        var fileBytes = ms.ToArray();
        string base64String = Convert.ToBase64String(fileBytes);

        string photoData = $"data:{photo.ContentType};base64,{base64String}";
        
        user.Photo = photoData;
        var updatedUser = _userService.UpdateUser(id, user);
        
        return Ok(new { photo = updatedUser.Photo });
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { 
            status = "healthy",
            service = "user",
            timestamp = DateTime.UtcNow
        });
    }
}