using System;

namespace WalletApi2.Domain.Entities
{
    public class Wallet
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Address { get; set; }
        public string PublicKey { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
