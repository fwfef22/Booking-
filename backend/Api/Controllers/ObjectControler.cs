using Microsoft.AspNetCore.Mvc;
using Application.Services;
using Application.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace Api.Controllers;

[ApiController]
[Route("api/Rent_Object")]

public class ObjectController : ControllerBase
{
    private readonly IRentObjectService _service;

    public ObjectController(IRentObjectService service) => _service = service;

    [HttpPost("search")]
    public async Task<ActionResult<List<RentObjectDto>>> SearchObjectsAsync([FromBody] SearchRentObjectRequest request)
    {
        var objects = await _service.SearchObjectsAsync(request);
        return Ok(objects);
    }

    [HttpPost("create-rent_object")]
    [Authorize]
    public async Task<ActionResult<GeneralResponse>> CreateObject([FromBody] CreateRentObjectRequest request)
    {
        var response = await _service.CreateAsync(request);
        return Ok(response);
    }
    /// <summary>
    /// Edits an existing RentObj.
    /// </summary>
    /// <remarks>
    /// Updates RentOj details such as name or other properties.
    /// </remarks>                                                       
    /// <param name="request">Any empty string wont be edited, similliar with negative value.
    /// public enum RentObjectStatus
    ///{
    ///     Active = 0,
    ///     Inactive = 1,
    ///     Archived = 2,
    ///     UnderMaintenance = 3
    ///}</param>
    /// <returns>General response with operation result.</returns>
    [HttpPost("Edit-RentObj")]
    public async Task<ActionResult<GeneralResponse>> EditRentObj([FromBody] EditRentObjectRequest request)
    {
        var response = await _service.EditAsync(request);
        return Ok(response);
    }
    /// <summary>
    /// Edits an existing room in the rent object.
    /// </summary>
    /// <remarks>
    /// Updates room details such as name or other properties.
    /// </remarks>                                                      
    /// <param name="request">Any empty string wont be edited.</param>
    /// <returns>General response with operation result.</returns>
    [HttpPost("Edit-Room")]
    public async Task<ActionResult<GeneralResponse>> EditRoom([FromBody] EditRentObjectRoom request)
    {
        var response = await _service.EditRoomAsync(request);
        return Ok(response);
    }
    [HttpPost("Add-Room")]
    public async Task<ActionResult<GeneralResponse>> AddRoom([FromBody] AddRentObjectRoom request)
    {
        var response = await _service.AddRoomAsync(request);
        return Ok(response);
    }

    [HttpGet("RentObjectByID")]
    public async Task<ActionResult<RentObjectDto>> GetRentObjByID(string RentObjID)
    {
        var RentObj = await _service.GetRentObjByIdAsync(RentObjID);
        if (RentObj == null)
            return NotFound(new { message = "Rent Object not found" });
        return Ok(RentObj);
    }

    [HttpGet("RentObjectWithLimit")]
    public async Task<ActionResult<RentObjectDto>> GetRentObjByLimit(int Limit)
    {
        var RentObj = await _service.GetRentObjLimit(Limit);
        return Ok(RentObj);
    }

    [HttpGet("RentObjectRoomByID")]
    public async Task<ActionResult<RentObjectRoomDto>> GetRentObjRoomByID(string RentObjRoomID)
    {
        var RentObjRoom = await _service.GetRentObjRoomByIdAsync(RentObjRoomID);
        if (RentObjRoom == null)
            return NotFound(new { message = "Rent Object Room not found" });
        return Ok(RentObjRoom);
    }
}