export type Category = "dress" | "shoes" | "bag" | "jacket";

export type Item = {
  id: number;
  name: string;
  category: Category;
  pricePerDay: number;
  sizes: string[]; // for shoes you can use "36-41"
  color: string;
  style?: string;
  description: string;
  images: string[];
  alt: string;
};

export type Rental = {
  id: string;
  itemId: number;
  start: string; // ISO date (yyyy-mm-dd)
  end: string;   // ISO date (yyyy-mm-dd)
  customer: { name: string; email: string; phone: string };
  createdAt: string;
  status: "pending" | "active" | "canceled";
};

import { query } from './db';

// Función para obtener todos los items desde la base de datos
async function getAllItemsFromDB(): Promise<Item[]> {
  try {
    const rows = await query("SELECT * FROM Items ORDER BY id DESC");
    return (rows || []).map((r: any) => {
      let images: string[];
      try {
        const parsedImages = typeof r.images === 'string' ? JSON.parse(r.images || '[]') : (r.images || []);
        // Filtrar y validar URLs de imágenes
        images = parsedImages.map((img: string) => {
          // Si la imagen no es una URL válida, usar una imagen por defecto
          if (!img || (!img.startsWith('http') && !img.startsWith('/images/'))) {
            return getDefaultImageForCategory(r.category);
          }
          return img;
        }).filter(Boolean);
      } catch {
        images = [];
      }
      
      // Si no hay imágenes válidas, usar una por defecto
      if (images.length === 0) {
        images = [getDefaultImageForCategory(r.category)];
      }
      
      return {
        id: r.id,
        name: r.name,
        category: r.category as Category,
        pricePerDay: Number(r.pricePerDay || 0),
        sizes: typeof r.sizes === 'string' ? JSON.parse(r.sizes || '[]') : (r.sizes || []),
        color: r.color || 'N/A',
        style: r.style || undefined,
        description: r.description || r.name,
        images,
        alt: r.alt || r.name,
      };
    });
  } catch (error) {
    console.error('Error fetching items from DB:', error);
    return [];
  }
}

// Función helper para obtener imagen por defecto según categoría
function getDefaultImageForCategory(category: string): string {
  // Usar una imagen por defecto que no requiera configuración adicional
  return "https://static.vecteezy.com/system/resources/previews/019/787/070/non_2x/no-photos-and-no-phones-forbidden-sign-on-transparent-background-free-png.png";
}

// Función para obtener un item específico desde la base de datos
async function getItemFromDB(id: number): Promise<Item | null> {
  try {
    const rows = await query("SELECT * FROM Items WHERE id = ?", [id]);
    if (!rows || rows.length === 0) return null;
    
    const r = rows[0] as any;
    let images: string[];
    try {
      const parsedImages = typeof r.images === 'string' ? JSON.parse(r.images || '[]') : (r.images || []);
      // Filtrar y validar URLs de imágenes
      images = parsedImages.map((img: string) => {
        // Si la imagen no es una URL válida, usar una imagen por defecto
        if (!img || (!img.startsWith('http') && !img.startsWith('/images/'))) {
          return getDefaultImageForCategory(r.category);
        }
        return img;
      }).filter(Boolean);
    } catch {
      images = [];
    }
    
    // Si no hay imágenes válidas, usar una por defecto
    if (images.length === 0) {
      images = [getDefaultImageForCategory(r.category)];
    }
    
    return {
      id: r.id,
      name: r.name,
      category: r.category as Category,
      pricePerDay: Number(r.pricePerDay || 0),
      sizes: typeof r.sizes === 'string' ? JSON.parse(r.sizes || '[]') : (r.sizes || []),
      color: r.color || 'N/A',
      style: r.style || undefined,
      description: r.description || r.name,
      images,
      alt: r.alt || r.name,
    };
  } catch (error) {
    console.error('Error fetching item from DB:', error);
    return null;
  }
}



export async function listItems(filters?: {
  q?: string;
  category?: Category;
  size?: string;
  color?: string;
  style?: string;
}) {
  const items = await getAllItemsFromDB();
  const q = filters?.q?.toLowerCase().trim();
  return items.filter((it) => {
    if (filters?.category && it.category !== filters.category) return false;
    
    // Búsqueda flexible de tallas (case insensitive)
    if (filters?.size) {
      const searchSize = filters.size.toLowerCase();
      const hasSize = it.sizes.some(size => size.toLowerCase() === searchSize);
      if (!hasSize) return false;
    }
    
    // Búsqueda flexible de color (case insensitive y parcial)
    if (filters?.color) {
      const searchColor = filters.color.toLowerCase();
      const itemColor = it.color.toLowerCase();
      if (!itemColor.includes(searchColor)) return false;
    }
    
    // Búsqueda flexible de estilo (case insensitive y parcial)
    if (filters?.style) {
      const searchStyle = filters.style.toLowerCase();
      const itemStyle = (it.style ?? "").toLowerCase();
      if (!itemStyle.includes(searchStyle)) return false;
    }
    
    // Búsqueda general más completa
    if (q) {
      const searchFields = [
        it.name,
        it.color,
        it.style ?? "",
        it.category,
        it.description,
        ...it.sizes
      ].join(" ").toLowerCase();
      
      // Permitir búsqueda por palabras separadas
      const searchWords = q.split(/\s+/).filter(word => word.length > 0);
      const matchesAllWords = searchWords.every(word => searchFields.includes(word));
      if (!matchesAllWords) return false;
    }
    
    return true;
  });
}

export async function getItem(id: number) {
  return await getItemFromDB(id);
}

export async function getItemRentals(itemId: number) {
  try {
    const rows = await query(
      "SELECT * FROM Rentals WHERE itemId = ? AND status = ? ORDER BY start ASC",
      [itemId, "active"]
    );
    return (rows || []).map((r: any) => ({
      id: r.id,
      itemId: r.itemId,
      start: typeof r.start === 'string' ? r.start.slice(0, 10) : r.start.toISOString().slice(0, 10),
      end: typeof r.end === 'string' ? r.end.slice(0, 10) : r.end.toISOString().slice(0, 10),
      customer: {
        name: r.customerName,
        email: r.customerEmail,
        phone: r.customerPhone,
      },
      createdAt: r.createdAt,
      status: r.status,
    }));
  } catch (error) {
    console.error('Error fetching item rentals:', error);
    return [];
  }
}

export function hasOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return !(aEnd < bStart || bEnd < aStart);
}

export async function isItemAvailable(itemId: number, start: string, end: string) {
  const rs = await getItemRentals(itemId);
  return rs.every((r) => !hasOverlap(start, end, r.start, r.end));
}

export async function createRental(data: Omit<Rental, "id" | "createdAt" | "status">) {
  const ok = await isItemAvailable(data.itemId, data.start, data.end);
  if (!ok) return { error: "Item is not available for the selected dates." as const };
  
  try {
    const id = crypto.randomUUID();
    // Formato MySQL TIMESTAMP: 'YYYY-MM-DD HH:MM:SS'
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    await query(
      "INSERT INTO Rentals (id, itemId, start, end, customerName, customerEmail, customerPhone, createdAt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, data.itemId, data.start, data.end, data.customer.name, data.customer.email, data.customer.phone, createdAt, "pending"]
    );
    
    const rental: Rental = {
      id,
      itemId: data.itemId,
      start: data.start,
      end: data.end,
      customer: data.customer,
      createdAt,
      status: "pending"
    };
    
    return { rental };
  } catch (error) {
    console.error('Error creating rental:', error);
    return { error: "Failed to create rental." as const };
  }
}

export async function listRentals() {
  try {
    const rows = await query("SELECT * FROM Rentals ORDER BY createdAt DESC");
    return (rows || []).map((r: any) => ({
      id: r.id,
      itemId: r.itemId,
      start: r.start,
      end: r.end,
      customer: {
        name: r.customerName,
        email: r.customerEmail,
        phone: r.customerPhone,
      },
      createdAt: r.createdAt,
      status: r.status,
    }));
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return [];
  }
}

export async function cancelRental(id: string) {
  try {
    const result = await query("UPDATE Rentals SET status = ? WHERE id = ?", ["canceled", id]);
    if (!result || (result as any).affectedRows === 0) {
      return { error: "Not found" as const };
    }
    return { ok: true as const };
  } catch (error) {
    console.error('Error canceling rental:', error);
    return { error: "Failed to cancel rental" as const };
  }
}

export async function approveRental(id: string) {
  try {
    const result = await query("UPDATE Rentals SET status = ? WHERE id = ?", ["active", id]);
    if (!result || (result as any).affectedRows === 0) {
      return { error: "Not found" as const };
    }
    return { ok: true as const };
  } catch (error) {
    console.error('Error approving rental:', error);
    return { error: "Failed to approve rental" as const };
  }
}

export async function deleteRental(id: string) {
  try {
    const result = await query("DELETE FROM Rentals WHERE id = ?", [id]);
    if (!result || (result as any).affectedRows === 0) {
      return { error: "Not found" as const };
    }
    return { ok: true as const };
  } catch (error) {
    console.error('Error deleting rental:', error);
    return { error: "Failed to delete rental" as const };
  }
}
