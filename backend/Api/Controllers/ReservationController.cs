using Microsoft.AspNetCore.Mvc;
using Application.Services;
using Application.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace Api.Controllers;

[ApiController]
[Route("api/Reservation")]

public class ReservationController : ControllerBase
{
    private readonly IReservationService _service;

    public ReservationController(IReservationService service) => _service = service;

    [HttpGet("ReservationByID")]
    public async Task<ActionResult<ReservationDto>> GetById(string reservationId)
    {
        var reservation = await _service.GetReservationById(reservationId);
        if (reservation == null)
            return NotFound(new { message = "Reservation not found" });
        return Ok(reservation);
    }

    [HttpGet("ReservationByUserID")]
    public async Task<ActionResult<List<ReservationDto>>> GetByUserId(string UserId)
    {
        var reservation = await _service.GetReservationByUserId(UserId);
        if (reservation == null)
            return NotFound(new { message = "Reservations not found" });
        return Ok(reservation);
    }
    [HttpPost("AllowedSlotsByRoomIdAndDateDay")]
    public async Task<ActionResult<List<TimeSpanForReservations>>> GetAllowedSlotsByRoomAndDate([FromBody] RequestTimeSpanForReservations request)
    {
        var TimeSpans = await _service.GetAllowedTimeSpanForReservationByRoomIdAndDate(request);
        if (TimeSpans == null)
            return NotFound(new { message = "Room not found" });
        return Ok(TimeSpans);
    }

    [HttpPost("create-reservation")]
    [Authorize]
    public async Task<ActionResult<ReservationIdResponse>> CreateReservation([FromBody] CreateReservationDto request)
    {
        if (request == null || !ModelState.IsValid)
            return BadRequest(new GeneralResponse { Success = false, Message = "Invalid request." });

        var result = await _service.CreateAsync(request);

        if (result == null || !result.Success)
            return BadRequest(new GeneralResponse { Success = false, Message = result?.Message ?? "Could not create reservation." });

        return CreatedAtAction(nameof(GetById), new { reservationId = result.ReservationId }, result);
    }

    [HttpPost("cancel-reservation")]
    [Authorize]
    public async Task<ActionResult<GeneralResponse>> CancelReservation([FromBody] CancelReservationDto request)
    {
        if (request == null || !ModelState.IsValid)
            return BadRequest(new GeneralResponse { Success = false, Message = "Invalid request." });

        var result = await _service.CancelReservationAsync(request.ReservationId);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }
}
