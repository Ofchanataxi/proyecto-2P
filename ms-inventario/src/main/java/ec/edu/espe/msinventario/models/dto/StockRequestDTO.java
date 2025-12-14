package ec.edu.espe.msinventario.models.dto;

public class StockRequestDTO {
    private Long sucursalId;
    private Long medicamentoId;
    private Integer cantidad;

    // Getters y Setters
    public Long getSucursalId() { return sucursalId; }
    public void setSucursalId(Long sucursalId) { this.sucursalId = sucursalId; }
    public Long getMedicamentoId() { return medicamentoId; }
    public void setMedicamentoId(Long medicamentoId) { this.medicamentoId = medicamentoId; }
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
}