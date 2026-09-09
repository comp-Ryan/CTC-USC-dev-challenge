import { getRestaurants, getVisits } from '@/lib/apiClient';
import { statsByRestaurant, grandTotal, sortByRecency } from '@/lib/visitStats';
import { RestaurantVisits } from './components/RestaurantVisits';

// Server component. Fetches restaurants on each request and renders a plain
// list. There is no loading state, no empty state, and no error handling: if
// the API is down or returns something unexpected, this throws.
export default async function HomePage() {
  const [restaurants, visits] = await Promise.all([getRestaurants(), getVisits()]);

  const stats = statsByRestaurant(visits);
  const sortedRestaurants = sortByRecency(restaurants, stats);
  const total = grandTotal(visits);

  return (
    <div>
      <h2 className="mb-1 text-lg font-medium">Restaurants</h2>
      <p className="mb-4 text-sm text-gray-500">
        ${total.toFixed(2)} spent across all restaurants
      </p>
      <ul className="space-y-3">
        {sortedRestaurants.map((restaurant, index) => {
          const restaurantStats = stats.get(restaurant.id);
          const isMostRecent = index === 0 && restaurantStats !== undefined;

          return (
            <li
              key={restaurant.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-medium">
                  {restaurant.name}
                  {isMostRecent && (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-normal text-green-700">
                      Most recent
                    </span>
                  )}
                </span>
                <span className="text-sm text-gray-500">
                  {restaurant.rating}★
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {restaurant.cuisine} · {restaurant.address}
              </div>
              <RestaurantVisits
                restaurantName={restaurant.name}
                total={restaurantStats?.total ?? 0}
                visits={restaurantStats?.visits ?? []}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
