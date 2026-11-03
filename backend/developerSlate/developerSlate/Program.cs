using Microsoft.EntityFrameworkCore;
using developerSlate.Data;
using developerSlate.Hubs;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration (PostgreSQL with resilient fallback)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var useInMemory = builder.Configuration.GetValue<bool>("UseInMemoryDb");
    if (useInMemory || string.IsNullOrEmpty(connectionString))
    {
        options.UseInMemoryDatabase("DeveloperSlateDb");
    }
    else
    {
        try
        {
            options.UseNpgsql(connectionString);
        }
        catch
        {
            options.UseInMemoryDatabase("DeveloperSlateDb");
        }
    }
});

// 2. SignalR Real-time communication
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});

// 3. CORS Policy for Angular Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://127.0.0.1:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 4. Controllers with JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddOpenApi();

var app = builder.Build();

// 5. Seed Database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        DbInitializer.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database. Falling back to InMemory if PostgreSQL is unavailable.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("FrontendPolicy");

app.UseAuthorization();

// 6. Map Controllers & SignalR Hubs
app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");
app.MapHub<CommunityHub>("/hubs/community");

app.Run();
