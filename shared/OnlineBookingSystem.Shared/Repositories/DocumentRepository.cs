using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace OnlineBookingSystem.Shared.Repositories;

public class DocumentRepository : IDocumentRepository
{
	private readonly IWebHostEnvironment _env;

	private const string UploadSubfolder = "uploads/documents";

	public DocumentRepository(IWebHostEnvironment env)
	{
		_env = env;
	}

	public async Task<string> SaveAsync(IFormFile file, CancellationToken ct = default(CancellationToken))
	{
		if (file.Length == 0)
		{
			throw new ArgumentException("Empty file");
		}
		string ext = Path.GetExtension(file.FileName);
		if (string.IsNullOrEmpty(ext))
		{
			ext = ".bin";
		}
		string name = $"{Guid.NewGuid():N}{ext}";
		string webRoot = (string.IsNullOrEmpty(_env.WebRootPath) ? Path.Combine(_env.ContentRootPath, "wwwroot") : _env.WebRootPath);
		string dir = Path.Combine(webRoot, "uploads", "documents");
		Directory.CreateDirectory(dir);
		string full = Path.Combine(dir, name);
		await using (FileStream fs = File.Create(full))
		{
			await file.CopyToAsync(fs, ct);
		}
		return "/" + "uploads/documents".Replace('\\', '/') + "/" + name;
	}
}
