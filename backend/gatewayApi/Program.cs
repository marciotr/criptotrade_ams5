using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
          // Mudei pra permitir somente o frontend e o gateway (não sei se é o ideal)
          policy
              .WithOrigins("http://localhost:5173", "http://localhost:5102")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Use CORS antes do Ocelot


// Add Ocelot services to the container
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);
builder.Services.AddOcelot();
// Register request-logging middleware as a service (avoid inline lambdas to be Hot Reload safe)
builder.Services.AddTransient<RequestLoggingMiddleware>();

var app = builder.Build();

app.UseCors("AllowFrontend");

// teste
// Use typed middleware instead of inline lambda to prevent HotReload lambda deletion errors
app.UseMiddleware<RequestLoggingMiddleware>();

app.UseOcelot().Wait();

app.Run();

