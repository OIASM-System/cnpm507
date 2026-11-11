using OISM.Infrastructure;
var builder=WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOismInfrastructure(builder.Configuration);
var app=builder.Build();
if(app.Environment.IsDevelopment()){app.UseSwagger();app.UseSwaggerUI();}
app.UseHttpsRedirection();
app.MapGet("/",()=>"OISM Backend is running!");
app.MapControllers();
app.Run();
