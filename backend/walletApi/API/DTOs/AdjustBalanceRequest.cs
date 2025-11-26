using System.ComponentModel.DataAnnotations;

namespace WalletApi2.API.DTOs
{
    public class AdjustBalanceRequest
    {
        [Required]
        public decimal DeltaAmount { get; set; }

        // Optional reference id for tracing the transaction
        public string? ReferenceId { get; set; }

        // Optional description for audit
        public string? Description { get; set; }
    }
}
