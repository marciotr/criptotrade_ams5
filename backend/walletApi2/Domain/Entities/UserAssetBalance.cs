using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WalletApi2.Domain.Entities
{
    public class UserAssetBalance
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

    [Required]
    [MaxLength(10)]
    public string AssetSymbol { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,8)")]
        public decimal AvailableAmount { get; set; }

        [Column(TypeName = "decimal(18,8)")]
        public decimal LockedAmount { get; set; }

        [Column(TypeName = "decimal(18,8)")]
        public decimal AverageAcquisitionPrice { get; set; }

    [Timestamp]
    public byte[]? RowVersion { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
