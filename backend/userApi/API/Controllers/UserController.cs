using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

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
    public IActionResult UpdateUser(int id, UserDTO userDto)
    {
        var updatedUser = _userService.UpdateUser(id, userDto);
        return updatedUser != null ? Ok(updatedUser) : NotFound();
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
}