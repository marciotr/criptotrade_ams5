namespace WalletApi.DTOs;

public record OperationResult(bool IsSuccess, string? Error, object? Data = null)
{
    public static OperationResult Failure(string? error) => new(false, error, null);
    public static OperationResult Ok(object? data = null) => new(true, null, data);
}
