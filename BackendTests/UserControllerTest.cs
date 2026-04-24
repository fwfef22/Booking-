using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Application.Services;
using Application.DTOs;
using Infrastructure.Repositories;
using Domain;

namespace BackendTests
{
    public class UserControllerTest
    {
        [Fact]
        public async Task Login()
        {
            //Arrange
            var MockRepo = new Mock<IUserRepository>();
            MockRepo.Setup(s => s.GetAllAsync())
                .ReturnsAsync(new List<User> { new User { Email = "test.email", PasswordHash = "1234", User_ID = "id" } });

            var MockHash = new Mock<IPasswordHasher>();
            MockHash.Setup(H => H.VerifyPassword("1234", "1234"))
                .Returns(true);

            var MockToken = new Mock<ITokenService>();
            MockToken.Setup(t => t.GenerateToken(It.Is<User>(u =>
                       u.Email == "test.email" &&
                       u.PasswordHash == "1234" &&
                       u.User_ID == "id"
                )))
                .Returns("token");

            var service = new UserService(MockRepo.Object, MockHash.Object, MockToken.Object);

            //Act
            var actionResult = await service.LoginAsync(new LoginRequest { Email = "test.email", Password = "1234" });

            //Assert                                               
            var okResult = Assert.IsType<AuthResponse>(actionResult);
            //var user = Assert.IsType<User>(okResult.User);
            Assert.Equal("token", okResult.Token);
            Assert.Equal("test.email", okResult.User.Email);

        }
        [Fact]
        public async Task LoginNotFound()
        {
            //Arrange
            var MockRepo = new Mock<IUserRepository>();
            MockRepo.Setup(s => s.GetAllAsync())
                .ReturnsAsync(new List<User> { new User { Email = "test.email", PasswordHash = "1234", User_ID = "id" } });

            var MockHash = new Mock<IPasswordHasher>();
            MockHash.Setup(H => H.VerifyPassword("1234", "1234"))
                .Returns(true);

            var MockToken = new Mock<ITokenService>();
            MockToken.Setup(t => t.GenerateToken(It.Is<User>(u =>
                       u.Email == "test.email" &&
                       u.PasswordHash == "1234" &&
                       u.User_ID == "id"
                )))
                .Returns("token");

            var service = new UserService(MockRepo.Object, MockHash.Object, MockToken.Object);

            //Act
            var actionResult = await service.LoginAsync(new LoginRequest { Email = "testnotfound.email", Password = "1234" });

            //Assert                                               
            var okResult = Assert.IsType<AuthResponse>(actionResult);
            Assert.False(okResult.Success);
            Assert.Equal("Invalid email or password", okResult.Message);
            //var user = Assert.IsType<User>(okResult.User);
            //Assert.Equal("token", okResult.Token);
            //Assert.Equal("test.email", okResult.User.Email);

        }
        [Fact]
        public async Task LoginWrongPassword()
        {
            //Arrange
            var MockRepo = new Mock<IUserRepository>();
            MockRepo.Setup(s => s.GetAllAsync())
                .ReturnsAsync(new List<User> { new User { Email = "test.email", PasswordHash = "1234", User_ID = "id" } });

            var MockHash = new Mock<IPasswordHasher>();
            MockHash.Setup(H => H.VerifyPassword("1234", "1234"))
                .Returns(true);

            var MockToken = new Mock<ITokenService>();
            MockToken.Setup(t => t.GenerateToken(It.Is<User>(u =>
                       u.Email == "test.email" &&
                       u.PasswordHash == "1234" &&
                       u.User_ID == "id"
                )))
                .Returns("token");

            var service = new UserService(MockRepo.Object, MockHash.Object, MockToken.Object);

            //Act
            var actionResult = await service.LoginAsync(new LoginRequest { Email = "test.email", Password = "4321" });

            //Assert                                               
            var okResult = Assert.IsType<AuthResponse>(actionResult);
            Assert.False(okResult.Success);
            Assert.Equal("Invalid email or password", okResult.Message);
            //var user = Assert.IsType<User>(okResult.User);
            //Assert.Equal("token", okResult.Token);
            //Assert.Equal("test.email", okResult.User.Email);

        }
    }
}
