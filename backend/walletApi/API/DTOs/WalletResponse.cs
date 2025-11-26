using System;

namespace WalletApi2.API.DTOs
{
    public class WalletResponse
    {
        public int WalletId { get; set; }
        public string Address { get; set; }
        public string PublicKey { get; set; }
    }
}
