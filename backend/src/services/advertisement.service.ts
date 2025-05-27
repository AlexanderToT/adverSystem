import { eq, like, and, sql, count, desc } from 'drizzle-orm';
import { advertisements, adStatistics } from '../db/schema';
import { Context } from 'hono';

export const advertisementService = {
  // 获取广告列表
  async getAdvertisements(params: any, c: Context) {
    const { search, adType, isDisplayed, page, limit } = params;
    const db = c.get('db');
    
    // 构建过滤条件
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(like(advertisements.name, `%${search}%`));
    }
    
    if (adType) {
      whereConditions.push(eq(advertisements.adType, adType));
    }
    
    if (isDisplayed !== undefined) {
      whereConditions.push(eq(advertisements.isDisplayed, isDisplayed === 'true'));
    }
    
    // 计算总数
    const countResult = await db
      .select({ count: count() })
      .from(advertisements)
      .where(whereConditions.length ? and(...whereConditions) : undefined);
    
    const total = countResult[0].count;
    
    // 查询广告列表
    const offset = (page - 1) * limit;
    const adsList = await db
      .select()
      .from(advertisements)
      .where(whereConditions.length ? and(...whereConditions) : undefined)
      .orderBy(desc(advertisements.createdAt))
      .limit(limit)
      .offset(offset);
    
    return {
      data: adsList,
      pagination: {
        total,
        current: page,
        pageSize: limit,
      },
    };
  },
  
  // 获取单个广告
  async getAdvertisementById(id: string, c: Context) {
    const db = c.get('db');
    
    const ad = await db
      .select()
      .from(advertisements)
      .where(eq(advertisements.id, id))
      .limit(1);
    
    if (!ad.length) {
      throw new Error('广告不存在');
    }
    
    return ad[0];
  },
  
  // 创建广告
  async createAdvertisement(data: any, c: Context) {
    const db = c.get('db');
    
    const newAd = await db.insert(advertisements).values({
      name: data.name,
      adType: data.adType,
      targetUrl: data.targetUrl,
      materialConfig: data.materialConfig,
      displayConfig: data.displayConfig,
      countryCodes: data.countryCodes ? JSON.stringify(data.countryCodes) : null,
      isDisplayed: data.isDisplayed ?? true,
    }).returning();
    
    return newAd[0];
  },
  
  // 更新广告
  async updateAdvertisement(id: string, data: any, c: Context) {
    const db = c.get('db');
    
    const existingAd = await db
      .select()
      .from(advertisements)
      .where(eq(advertisements.id, id))
      .limit(1);
    
    if (!existingAd.length) {
      throw new Error('广告不存在');
    }
    
    const updateData = {
      ...(data.name && { name: data.name }),
      ...(data.adType && { adType: data.adType }),
      ...(data.targetUrl !== undefined && { targetUrl: data.targetUrl }),
      ...(data.materialConfig && { materialConfig: data.materialConfig }),
      ...(data.displayConfig && { displayConfig: data.displayConfig }),
      ...(data.countryCodes && { countryCodes: JSON.stringify(data.countryCodes) }),
      ...(data.isDisplayed !== undefined && { isDisplayed: data.isDisplayed }),
      updatedAt: new Date(),
    };
    
    const updatedAd = await db
      .update(advertisements)
      .set(updateData)
      .where(eq(advertisements.id, id))
      .returning();
    
    return updatedAd[0];
  },
  
  // 删除广告
  async deleteAdvertisement(id: string, c: Context) {
    const db = c.get('db');
    
    const existingAd = await db
      .select()
      .from(advertisements)
      .where(eq(advertisements.id, id))
      .limit(1);
    
    if (!existingAd.length) {
      throw new Error('广告不存在');
    }
    
    await db
      .delete(advertisements)
      .where(eq(advertisements.id, id));
    
    return true;
  },
  
  // 批量更新广告状态
  async batchUpdateAdsStatus(adIds: string[], isDisplayed: boolean, c: Context) {
    const db = c.get('db');
    
    const result = await db
      .update(advertisements)
      .set({
        isDisplayed,
        updatedAt: new Date(),
      })
      .where(sql`${advertisements.id} IN ${adIds}`)
      .returning({ id: advertisements.id });
    
    return result.map((item: any) => item.id);
  },
  
  // 获取广告统计数据
  async getAdStats(id: string, params: any, c: Context) {
    const db = c.get('db');
    const { startDate, endDate, groupBy } = params;
    
    // 检查广告是否存在
    const existingAd = await db
      .select()
      .from(advertisements)
      .where(eq(advertisements.id, id))
      .limit(1);
    
    if (!existingAd.length) {
      throw new Error('广告不存在');
    }
    
    // 构建日期过滤条件
    const dateConditions = [];
    if (startDate) {
      dateConditions.push(sql`${adStatistics.eventTime} >= ${startDate}`);
    }
    if (endDate) {
      dateConditions.push(sql`${adStatistics.eventTime} <= ${endDate}`);
    }
    
    // 根据分组参数生成SQL
    let groupByExpr;
    if (groupBy === 'day') {
      groupByExpr = sql`DATE_TRUNC('day', ${adStatistics.eventTime})`;
    } else if (groupBy === 'week') {
      groupByExpr = sql`DATE_TRUNC('week', ${adStatistics.eventTime})`;
    } else {
      groupByExpr = sql`DATE_TRUNC('month', ${adStatistics.eventTime})`;
    }
    
    // 查询统计数据
    const statsData = await db
      .select({
        date: groupByExpr,
        clicks: count(sql`CASE WHEN ${adStatistics.eventType} = 'click' THEN 1 END`),
        impressions: count(sql`CASE WHEN ${adStatistics.eventType} = 'impression' THEN 1 END`),
      })
      .from(adStatistics)
      .where(
        and(
          eq(adStatistics.advertisementId, id),
          ...dateConditions
        )
      )
      .groupBy(groupByExpr)
      .orderBy(groupByExpr);
    
    return statsData;
  }
}; 