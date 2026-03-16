import { pool } from "../../config/db.js";

const getAllCommodity = async () => {
  const query = `
    SELECT 
        c.id,
        c.name,
        c.is_active,
        cp.financial_year,
        cp.price_per_unit,
        cp.updated_at
    FROM commodities c
    LEFT JOIN commodity_prices cp 
        ON cp.commodity_id = c.id
    WHERE c.is_active = true
    ORDER BY c.name
  `;

  const result = await pool.query(query);
  return result.rows;
};

const updateCommodity = async (
  commodityId,
  name,
  financial_year,
  price_per_unit,
  userId
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (name) {
      await client.query(
        `UPDATE commodities 
         SET name = $1 
         WHERE id = $2`,
        [name, commodityId]
      );
    }

    if (financial_year && price_per_unit) {
      await client.query(
        `
        UPDATE commodity_prices
        SET price_per_unit = $1,
            last_edited_by = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE commodity_id = $3
        AND financial_year = $4
        `,
        [price_per_unit, userId, commodityId, financial_year]
      );
    }

    await client.query("COMMIT");

    return { commodityId };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const deleteCommodity = async (commodityId) => {

  // Soft delete
  await pool.query(
    `UPDATE commodities
     SET is_active = false
     WHERE id = $1`,
    [commodityId]
  );
};


const createCommodityWithPrice = async (commodityData, priceData, userId) => {
    const client = await pool.connect();
    
    try {
        await client.query("BEGIN");

        // 1. Upsert Commodity
        // This query inserts the commodity if it doesn't exist, and if it does exist, it simply returns its id
        const commodityQuery = `
            INSERT INTO commodities (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `;
        const commodityResult = await client.query(commodityQuery, [commodityData.name]);
        const commodity = commodityResult.rows[0];

        // 2. Insert or Update Price
        const priceQuery = `
            INSERT INTO commodity_prices (commodity_id, financial_year, price_per_unit, last_edited_by)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (commodity_id, financial_year) 
            DO UPDATE SET 
                price_per_unit = EXCLUDED.price_per_unit,
                last_edited_by = EXCLUDED.last_edited_by,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id, financial_year, price_per_unit
        `;
        const priceResult = await client.query(priceQuery, [
            commodity.id, 
            priceData.financial_year, 
            priceData.price_per_unit,
            userId
        ]);
        const price = priceResult.rows[0];

        await client.query("COMMIT");

        return {
            commodity,
            price
        };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};



export default {
  createCommodityWithPrice,
  getAllCommodity,
  updateCommodity,
  deleteCommodity,
};