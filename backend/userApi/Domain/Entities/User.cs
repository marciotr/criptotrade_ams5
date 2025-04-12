public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    
    // Torne estes campos opcionais
    public string? Phone { get; set; } // Adicione o operador ? para permitir valor nulo
    public string? Address { get; set; }
    
    public string Password { get; set; }
    public string? Photo { get; set; }
    public string Role { get; set; } = "user";
}
