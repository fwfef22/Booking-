using Microsoft.AspNetCore.Mvc;
using Application.Services;
using Application.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace Api.Controllers;

[ApiController]
[Route("api/Payment")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _service;

    public PaymentController(IPaymentService service) => _service = service;

    [HttpPost("make-payment")]
    [Authorize]
    public async Task<ActionResult<GeneralResponse>> CreatePayment([FromBody] CreatePaymentDto request)
    {
        var response = await _service.CreatePaymentAsync(request);
        return Ok(response);
    }

    [HttpGet("get-payment-by-id")]
    public async Task<ActionResult<PaymentDto>> GetPaymentByPaymentId(string paymentId)
    {
        var payment = await _service.GetPaymentByPaymentId(paymentId);
        if (payment == null)
            return NotFound(new { message = "Payment not found" });
        return Ok(payment);
    }

    [HttpGet("get-payments-by-reservation-id")]
    public async Task<ActionResult<List<PaymentDto>>> GetPaymentsByReservationId(string reservationId)
    {
        var payments = await _service.GetPaymentsByReservationId(reservationId);
        return Ok(payments);
    }

    [HttpPost("query-payments")]
    public async Task<ActionResult<List<PaymentDto>>> QueryPayments([FromQuery] PaymentQueryDto query)
    {
        var payments = await _service.QueryPaymentsAsync(query);
        return Ok(payments);
    }

    [HttpGet("confirm-refund-payments")]
    [Authorize]
    public async Task<ActionResult<GeneralResponse>> ConfirmRefund(string reservationId)
    {
        var payments = await _service.CancelPaymentConfirmAsync(reservationId);
        return Ok(payments);
    }
}