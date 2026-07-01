package net.cabrasky.table2taste.backend.modelDto;

public class UploadImageResponseDTO {
    private String url;

    public UploadImageResponseDTO() {
    }

    public UploadImageResponseDTO(String url) {
        this.url = url;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
