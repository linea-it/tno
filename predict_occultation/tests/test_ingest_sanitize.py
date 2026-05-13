import unittest

import pandas as pd
from asteroid.asteroid import _sanitize_numeric_columns_for_ingest_inplace


class TestSanitizeNumericIngest(unittest.TestCase):
    def test_pmdec_sentinel_becomes_nan(self):
        df = pd.DataFrame(
            {
                "hash_id": ["h1"],
                "pmdec": ["****"],
                "pmra": [1.0],
            }
        )
        _sanitize_numeric_columns_for_ingest_inplace(df, ["pmdec", "pmra"])
        self.assertTrue(pd.isna(df.loc[0, "pmdec"]))
        self.assertAlmostEqual(float(df.loc[0, "pmra"]), 1.0)

    def test_multiple_star_strings_coerced(self):
        df = pd.DataFrame({"x": ["***", "**", "1.5"]})
        _sanitize_numeric_columns_for_ingest_inplace(df, ["x"])
        self.assertTrue(pd.isna(df.loc[0, "x"]))
        self.assertTrue(pd.isna(df.loc[1, "x"]))
        self.assertAlmostEqual(float(df.loc[2, "x"]), 1.5)

    def test_numeric_string_preserved(self):
        df = pd.DataFrame({"y": [" 2.5 "]})
        _sanitize_numeric_columns_for_ingest_inplace(df, ["y"])
        self.assertAlmostEqual(float(df.loc[0, "y"]), 2.5)


if __name__ == "__main__":
    unittest.main()
