using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

public class RequestLoggingMiddleware : IMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            var path = context.Request.Path.Value ?? string.Empty;
            if (path.StartsWith("/wallet", StringComparison.OrdinalIgnoreCase) ||
                path.StartsWith("/balance", StringComparison.OrdinalIgnoreCase))
            {
                var auth = context.Request.Headers["Authorization"].FirstOrDefault();
                Console.WriteLine($"[Gateway] Incoming {context.Request.Method} {path} - Authorization: {(auth ?? "<none>")}");
            }
        }
        catch
        {
            // swallow logging errors to avoid interfering with request pipeline
        }

        await next(context);
    }
}
