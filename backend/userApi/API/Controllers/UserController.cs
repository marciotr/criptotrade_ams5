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
        try
        {
            var result = _userService.RegisterUser(userDto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erro ao registrar usuário: {ex.Message}");
            return StatusCode(500, new { message = "Erro interno ao registrar usuário" });
        }
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

            if (updateDto.MfaEnabled.HasValue)
            {
                existingUser.MfaEnabled = updateDto.MfaEnabled.Value;
            }
            if (updateDto.MfaType != null)
            {
                existingUser.MfaType = updateDto.MfaType;
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

        try
        {
            // wwwroot/uploads/{userId}
            var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            var userFolder = Path.Combine(uploadsRoot, id.ToString());
            if (!Directory.Exists(userFolder)) Directory.CreateDirectory(userFolder);

            // Gero o nome do arquivo correto
            var ext = Path.GetExtension(photo.FileName);
            if (string.IsNullOrEmpty(ext))
            {
                ext = photo.ContentType switch
                {
                    "image/jpeg" => ".jpg",
                    "image/png" => ".png",
                    "image/gif" => ".gif",
                    _ => ".bin"
                };
            }

            var fileName = $"profile_{Guid.NewGuid()}{ext}";
            var fullPath = Path.Combine(userFolder, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await photo.CopyToAsync(stream);
            }

            // Salvo a url path
            var publicUrlRelative = $"/uploads/{id}/{fileName}";
            var requestHost = string.Empty;
            try
            {
                requestHost = $"{Request.Scheme}://{Request.Host.Value}";
            }
            catch
            {
                requestHost = string.Empty;
            }

            var publicUrl = string.IsNullOrEmpty(requestHost) ? publicUrlRelative : requestHost + publicUrlRelative;
            user.Photo = publicUrl;
            var updatedUser = _userService.UpdateUser(id, user);

            return Ok(new { photo = updatedUser.Photo, url = publicUrl });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erro ao salvar foto do usuário {id}: {ex.Message}");
            return StatusCode(500, new { message = "Erro ao salvar foto" });
        }
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