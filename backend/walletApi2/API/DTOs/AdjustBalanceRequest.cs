using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WalletApi2.API.DTOs
{
    public class AdjustBalanceRequest : IValidatableObject
    {
    [Required]
    public required string AssetSymbol { get; set; }

        [Required]
        // Allow wide positive/negative range; we'll validate non-zero magnitude in Validate()
        [Range(typeof(decimal), "-79228162514264337593543950335", "79228162514264337593543950335")]
        public decimal DeltaAmount { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // Reject zero or values too close to zero
            var minAbs = 0.00000001m;
            if (Math.Abs(DeltaAmount) < minAbs)
            {
                yield return new ValidationResult($"DeltaAmount must be non-zero and have absolute value >= {minAbs}.", new[] { nameof(DeltaAmount) });
            }

            if (string.IsNullOrWhiteSpace(AssetSymbol))
            {
                yield return new ValidationResult("AssetSymbol is required.", new[] { nameof(AssetSymbol) });
            }
        }
    }
}
