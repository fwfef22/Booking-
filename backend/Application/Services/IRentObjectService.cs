using Application.DTOs;

namespace Application.Services;

public interface IRentObjectService
{
    Task<GeneralResponse> CreateAsync(CreateRentObjectRequest request);
    Task<GeneralResponse> EditAsync(EditRentObjectRequest request);
    Task<GeneralResponse> AddRoomAsync(AddRentObjectRoom request);
    Task<GeneralResponse> EditRoomAsync(EditRentObjectRoom request);
    //Task<GeneralResponse> DeleteRoomAsync(CreateRentObjectRequest request);
    Task<List<RentObjectDto>> SearchObjectsAsync(SearchRentObjectRequest request);
    Task<RentObjectDto> GetRentObjByIdAsync(string RentObjID);
    Task<RentObjectRoomDto> GetRentObjRoomByIdAsync(string RentObjRoomID);
    Task<List<RentObjectDto>> GetRentObjLimit(int Limit);
}