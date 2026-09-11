// Movie.rating is stored as a String (e.g. "8.4", "N/A"), so a plain
// { rating: -1 } sort compares it lexicographically - "N/A" sorts above
// every numeric rating in descending order because 'N' outranks any digit
// character. Convert to a number first (falling back to -1, i.e. lowest,
// for "N/A"/missing values) so "highest rated" actually means highest rated.
const RATING_SORT_STAGES = [
    {
        $addFields: {
            _numericRating: { $convert: { input: '$rating', to: 'double', onError: -1, onNull: -1 } },
        },
    },
    { $sort: { _numericRating: -1, _id: 1 } },
    { $unset: '_numericRating' },
];

const SORT_PIPELINES = {
    rating: RATING_SORT_STAGES,
    year: [{ $sort: { year: -1, _id: 1 } }],
    trending: [{ $sort: { discussionCount: -1, year: -1, _id: -1 } }],
};

const getSortPipeline = (sortKey) => SORT_PIPELINES[sortKey] || SORT_PIPELINES.trending;

module.exports = { getSortPipeline };
