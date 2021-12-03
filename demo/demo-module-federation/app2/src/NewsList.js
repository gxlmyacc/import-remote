import React, { useState, useEffect } from 'react';

const NewsList = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('http://hn.algolia.com/api/v1/search?query=react')
        .then(rsp => rsp.json())
        .then(json => json.hits);

      setData(res);
    };

    fetchData();
  }, []);

  return (
    <ul>
      111
      {data.map(item => (
        <li key={item.objectID}>
          <a href={item.url}>{item.title}</a>
        </li>
      ))}
    </ul>
  );
};

export default NewsList;
