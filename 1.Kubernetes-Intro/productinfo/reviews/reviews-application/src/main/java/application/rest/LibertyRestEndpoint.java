package application.rest;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.ProcessingException;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Application;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.StringReader;

@Path("/")
public class LibertyRestEndpoint extends Application {

    private final static Boolean ratings_enabled = Boolean.valueOf(System.getenv("ENABLE_RATINGS"));
    private final static String star_color = System.getenv("STAR_COLOR") == null ? "black" : System.getenv("STAR_COLOR");
    private final static String services_domain = System.getenv("SERVICES_DOMAIN") == null ? "" : ("." + System.getenv("SERVICES_DOMAIN"));
    private final static String ratings_hostname = System.getenv("RATINGS_HOSTNAME") == null ? "ratings" : System.getenv("RATINGS_HOSTNAME");
    private final static String ratings_service = String.format("http://%s%s:9080/ratings", ratings_hostname, services_domain);
    private final static String pod_hostname = System.getenv("HOSTNAME");
    private final static String clustername = System.getenv("CLUSTER_NAME");
    private final static String[] headers_to_propagate = {
        "x-request-id",
        "x-ot-span-context",
        "x-datadog-trace-id",
        "x-datadog-parent-id",
        "x-datadog-sampling-priority",
        "traceparent",
        "tracestate",
        "x-cloud-trace-context",
        "grpc-trace-bin",
        "x-b3-traceid",
        "x-b3-spanid",
        "x-b3-parentspanid",
        "x-b3-sampled",
        "x-b3-flags",
        "sw8",
        "end-user",
        "user-agent",
        "cookie",
        "authorization",
        "jwt",
    };

    private String getJsonResponse (String productId, int starsReviewer1, int starsReviewer2) {
    	String result = "{";
    	result += "\"id\": \"" + productId + "\",";
      result += "\"podname\": \"" + pod_hostname + "\",";
      result += "\"clustername\": \"" + clustername + "\",";
    	result += "\"reviews\": [";

    	// reviewer 1:
    	result += "{";
    	result += "  \"reviewer\": \"Reviewer1\",";
    	result += "  \"text\": \"An extremely entertaining play by Shakespeare. The slapstick humour is refreshing!\"";
      if (ratings_enabled) {
        if (starsReviewer1 != -1) {
          result += ", \"rating\": {\"stars\": " + starsReviewer1 + ", \"color\": \"" + star_color + "\"}";
        }
        else {
          result += ", \"rating\": {\"error\": \"Ratings service is currently unavailable\"}";
        }
      }
    	result += "},";

    	// reviewer 2:
    	result += "{";
    	result += "  \"reviewer\": \"Reviewer2\",";
    	result += "  \"text\": \"Absolutely fun and entertaining. The play lacks thematic depth when compared to other plays by Shakespeare.\"";
      if (ratings_enabled) {
        if (starsReviewer2 != -1) {
          result += ", \"rating\": {\"stars\": " + starsReviewer2 + ", \"color\": \"" + star_color + "\"}";
        }
        else {
          result += ", \"rating\": {\"error\": \"Ratings service is currently unavailable\"}";
        }
      }
    	result += "}";

    	result += "]";
    	result += "}";

    	return result;
    }

    private JsonObject getRatings(String productId, HttpHeaders requestHeaders) {
      ClientBuilder cb = ClientBuilder.newBuilder();
      Integer timeout = star_color.equals("black") ? 10000 : 2500;
      cb.property("com.ibm.ws.jaxrs.client.connection.timeout", timeout);
      cb.property("com.ibm.ws.jaxrs.client.receive.timeout", timeout);
      Client client = cb.build();
      WebTarget ratingsTarget = client.target(ratings_service + "/" + productId);
      Invocation.Builder builder = ratingsTarget.request(MediaType.APPLICATION_JSON);
      for (String header : headers_to_propagate) {
        String value = requestHeaders.getHeaderString(header);
        if (value != null) {
          builder.header(header,value);
        }
      }
      try {
        Response r = builder.get();

        int statusCode = r.getStatusInfo().getStatusCode();
        if (statusCode == Response.Status.OK.getStatusCode()) {
          try (StringReader stringReader = new StringReader(r.readEntity(String.class));
               JsonReader jsonReader = Json.createReader(stringReader)) {
            return jsonReader.readObject();
          }
        } else {
          System.out.println("Error: unable to contact " + ratings_service + " got status of " + statusCode);
          return null;
        }
      } catch (ProcessingException e) {
        System.err.println("Error: unable to contact " + ratings_service + " got exception " + e);
        return null;
      }
    }

    @GET
    @Path("/health")
    public Response health() {
        return Response.ok().type(MediaType.APPLICATION_JSON).entity("{\"status\": \"Reviews is healthy\"}").build();
    }

    @GET
    @Path("/reviews/{productId}")
    public Response bookReviewsById(@PathParam("productId") int productId, @Context HttpHeaders requestHeaders) {
      int starsReviewer1 = -1;
      int starsReviewer2 = -1;

      if (ratings_enabled) {
        JsonObject ratingsResponse = getRatings(Integer.toString(productId), requestHeaders);
        if (ratingsResponse != null) {
          if (ratingsResponse.containsKey("ratings")) {
            JsonObject ratings = ratingsResponse.getJsonObject("ratings");
            if (ratings.containsKey("Reviewer1")){
          	  starsReviewer1 = ratings.getInt("Reviewer1");
            }
            if (ratings.containsKey("Reviewer2")){
              starsReviewer2 = ratings.getInt("Reviewer2");
            }
          }
        }
      }

      String jsonResStr = getJsonResponse(Integer.toString(productId), starsReviewer1, starsReviewer2);
      return Response.ok().type(MediaType.APPLICATION_JSON).entity(jsonResStr).build();
    }
}
