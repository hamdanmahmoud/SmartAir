const { Client } = require('@elastic/elasticsearch');

// Cloud way

const client = new Client({
  node: 'https://elastic:' + process.env.ELASTICSEARCH_PW + process.env.ELASTICSEARCH_CLOUD_URL,
});

// Local way
//const client = new Client({
// node: 'http://localhost:9200',
// auth: {
//     username: 'elastic',
//     password: process.env.ELASTICSEARCH_PW
// }
//});

// console.log(client);

export interface Readings {
  general: {
    humidity: number;
    temperature: number;
  };
  hazardous: {
    vibration: number;
  };
  poisonous: {
    co: number;
    ch4: number;
    smoke: number;
  };
}

export function createReading(device: string, readings: Readings) {
  // client.indices.delete({
  //     index: 'readings',
  //   }).then(function(resp: any) {
  //     console.log("Successful query!");
  //     console.log(JSON.stringify(resp, null, 4));
  //   }, function(err: any) {
  //     console.trace(err.message);
  //   });

  return client.index({
    index: 'readings',
    body: {
      device: device,
      date: new Date(),
      values: readings,
    },
  });
}

export function retrieveReadings(device: string, from: Date, to: Date) {
  // client.indices.delete({
  //     index: 'readings',
  //   }).then(function(resp: any) {
  //     console.log("Successful query!");
  //     console.log(JSON.stringify(resp, null, 4));
  //  }, function(err: any) {
  //     console.trace(err.message);
  //   });

  // client.delete_by_query({
  //     index: 'readings',
  //     body: {
  //         query: {
  //             bool: {
  //                 filter: [
  //                     {
  //                         range: {
  //                             date: {
  //                                 gte: new Date(new Date().getTime() - (24 * 60 * 60 * 1000))
  //                             }
  //                         }
  //                     }
  //                 ]
  //             }
  //         }
  //     }
  // })

  return client.search({
    index: 'readings',
    filterPath: 'hits.hits._source',
    size: 1000,
    body: {
      query: {
        bool: {
          must: [
            {
              match: {
                device: device,
              },
            },
          ],
          filter: [
            {
              range: {
                date: {
                  gte: from,
                  lte: to,
                },
              },
            },
          ],
        },
      },
      _source: {
        excludes: ['device'],
      },
    },
  });
}
