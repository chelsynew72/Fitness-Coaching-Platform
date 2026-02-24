import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

export interface FoodResult {
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: string;
  barcode: string;
}

@Injectable()
export class OpenFoodFactsService {
  private readonly BASE_URL = 'https://world.openfoodfacts.org';

  async searchFood(query: string): Promise<FoodResult[]> {
    try {
      const url = `${this.BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10&fields=product_name,brands,nutriments,quantity,code`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Open Food Facts API error');

      const data = await res.json();

      if (!data.products || data.products.length === 0) {
        return [];
      }

      return data.products
        .filter((p: any) => p.product_name && p.nutriments)
        .map((p: any) => this.mapProduct(p));
    } catch (err) {
      throw new HttpException(
        'Food search failed — please try again',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getFoodByBarcode(barcode: string): Promise<FoodResult | null> {
    try {
      const url = `${this.BASE_URL}/api/v0/product/${barcode}.json`;
      const res = await fetch(url);
      if (!res.ok) return null;

      const data = await res.json();
      if (data.status !== 1 || !data.product) return null;

      return this.mapProduct(data.product);
    } catch {
      return null;
    }
  }

  private mapProduct(p: any): FoodResult {
    const n = p.nutriments || {};
    return {
      name: p.product_name || 'Unknown',
      brand: p.brands || '',
      calories: Math.round(n['energy-kcal_100g'] || n['energy_100g'] / 4.184 || 0),
      protein: Math.round((n['proteins_100g'] || 0) * 10) / 10,
      carbs: Math.round((n['carbohydrates_100g'] || 0) * 10) / 10,
      fat: Math.round((n['fat_100g'] || 0) * 10) / 10,
      quantity: p.quantity || '100g',
      barcode: p.code || '',
    };
  }
}