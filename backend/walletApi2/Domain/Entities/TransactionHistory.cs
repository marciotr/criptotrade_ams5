using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WalletApi2.Domain.Entities;
using WalletApi2.Domain.Enums;

namespace WalletApi2.Domain.Entities
{
    public class TransactionHistory
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

    [Required]
    [MaxLength(10)]
    public string AssetSymbol { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,8)")]
        public decimal Amount { get; set; }

        [Required]
        public TransactionType Type { get; set; }

    public string? ReferenceId { get; set; }

    public string? TransactionHash { get; set; }

        [Required]
        public TransactionStatus Status { get; set; }

        [Column(TypeName = "decimal(18,8)")]
        public decimal PriceAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
